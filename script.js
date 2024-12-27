document.getElementById("prediction-form").addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const skills = document.getElementById("skills").value;
    const experience = document.getElementById("experience").value;

    // Placeholder logic for prediction
    const score = Math.min(100, (experience * 10) + skills.split(",").length * 5);

    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = `
        <h3>Results for ${name}</h3>
        <p>Your predicted employability score is <strong>${score}</strong>.</p>
        <p>We recommend focusing on skills development and networking to improve your score.</p>
    `;
});
