const form = document.getElementById("studentForm");
const studentList = document.getElementById("studentList");

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");

const captureBtn = document.getElementById("captureBtn");
const registerFaceBtn = document.getElementById("registerFaceBtn");

const recognitionResult =
    document.getElementById("recognitionResult");



async function loadStudents() {

    try {

        const response =
            await fetch("/api/students");

        const students =
            await response.json();

        studentList.innerHTML = "";

        students.forEach(student => {

            const li = document.createElement("li");

            li.innerText =
                `${student.name} - ${student.rollNumber} - ${student.department}`;

            studentList.appendChild(li);

        });

    } catch (error) {
        console.log("Load Students Error:", error);
    }
}



form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const name =
        document.getElementById("name").value;

    const rollNumber =
        document.getElementById("rollNumber").value;

    const department =
        document.getElementById("department").value;

    try {

        const response =
            await fetch("/api/students", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name,
                    rollNumber,
                    department
                })

            });

        const data = await response.json();

        console.log(data);

        loadStudents();

    } catch (error) {
        console.log("Student Register Error:", error);
    }
});



async function startWebcam() {

    try {

        const stream =
            await navigator.mediaDevices.getUserMedia({
                video: true
            });

        video.srcObject = stream;

    } catch (error) {
        console.log("Webcam Error:", error);
    }
}



captureBtn.addEventListener("click", () => {

    const context =
        canvas.getContext("2d");

    context.drawImage(video, 0, 0, 320, 240);
});



async function loadModels() {

    await faceapi.nets.tinyFaceDetector.loadFromUri("./models");

    await faceapi.nets.faceLandmark68Net.loadFromUri("./models");

    await faceapi.nets.faceRecognitionNet.loadFromUri("./models");

    console.log("All Face API Models Loaded");
}



registerFaceBtn.addEventListener("click", async () => {

    try {

        const detection =
            await faceapi
                .detectSingleFace(
                    video,
                    new faceapi.TinyFaceDetectorOptions()
                )
                .withFaceLandmarks()
                .withFaceDescriptor();

        if (!detection) {
            alert("No face detected");
            return;
        }

        const rollNumber =
            document.getElementById("faceRollNumber").value;

        const faceDescriptor =
            Array.from(detection.descriptor);

        console.log("Descriptor Length:", faceDescriptor.length);

        const response =
            await fetch("/api/students/register-face", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    rollNumber,
                    faceDescriptor
                })

            });

        const data = await response.json();

        alert(data.message);

    } catch (error) {
        console.log("Register Face Error:", error);
    }
});


let recognitionRunning = false;

async function startRecognition() {

    if (recognitionRunning) return;
    recognitionRunning = true;

    try {

        const response =
            await fetch("/api/students/with-face");

        const students =
            await response.json();

        if (!students || students.length === 0) {
            console.log("NO REGISTERED FACES");
            return;
        }

        const labeledDescriptors = students
            .map(student => {

                if (
                    !student.faceDescriptor ||
                    student.faceDescriptor.length !== 128
                ) {
                    return null;
                }

                const descriptor =
                    new Float32Array(student.faceDescriptor);

                return new faceapi.LabeledFaceDescriptors(
                    student.name,
                    [descriptor]
                );
            })
            .filter(item => item !== null);

        if (labeledDescriptors.length === 0) {
            console.log("NO VALID FACE DATA");
            return;
        }

        const faceMatcher =
            new faceapi.FaceMatcher(labeledDescriptors, 0.85);

        setInterval(async () => {

            const detection =
                await faceapi
                    .detectSingleFace(
                        video,
                        new faceapi.TinyFaceDetectorOptions()
                    )
                    .withFaceLandmarks()
                    .withFaceDescriptor();

            if (!detection) return;

            const result =
                faceMatcher.findBestMatch(detection.descriptor);

            console.log(result.toString());

            if (result.label !== "unknown") {

                recognitionResult.innerText =
                    `Recognized: ${result.label}`;

                const matchedStudent =
                    students.find(
                        s => s.name === result.label
                    );

                if (!matchedStudent) return;

                await fetch("/api/attendance/mark", {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        rollNumber:
                            matchedStudent.rollNumber,

                        name:
                            matchedStudent.name

                    })

                });

            } else {

                recognitionResult.innerText =
                    "Face Not Recognized";
            }

        }, 3000);

    } catch (error) {
        console.log("Recognition Error:", error);
    }
}


loadStudents();
startWebcam();
loadModels();
startRecognition();