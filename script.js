document.getElementById("prediction-form").addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const skills = document.getElementById("skills").value.trim();
    const experience = parseFloat(document.getElementById("experience").value);

    // Validate inputs
    if (!name || !email || !skills || isNaN(experience) || experience < 0) {
        alert("Please enter valid details.");
        return;
    }

    // Employability score calculation
    const score = Math.min(100, (experience * 10) + skills.split(",").length * 5);

    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = `
        <h3>Results for ${name}</h3>
        <p>Your predicted employability score is <strong>${score}</strong>.</p>
        <p>We recommend focusing on skills development and networking to improve your score.</p>
    `;
});

document.addEventListener("DOMContentLoaded", function () {
    const chatbotBtn = document.getElementById("chatbot-btn");
    const chatboxContainer = document.getElementById("chatbox-container");
    const closeChatbox = document.getElementById("close-chatbox");
    const sendBtn = document.getElementById("send-btn");
    const chatInput = document.getElementById("chat-input");
    const chatboxMessages = document.getElementById("chatbox-messages");
    const voiceBtn = document.getElementById("voice-btn");

    // Initialize Speech Recognition (for Voice Input)
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = true;
    recognition.interimResults = true;

    // Initialize Speech Synthesis (for Voice Output)
    const synth = window.speechSynthesis;

    // Animate Chatbot Button
    chatbotBtn.style.transition = "all 0.3s ease-in-out";
    chatbotBtn.addEventListener("mouseover", function () {
        chatbotBtn.style.transform = "scale(1.1)";
    });
    chatbotBtn.addEventListener("mouseout", function () {
        chatbotBtn.style.transform = "scale(1)";
    });

    // Add bouncing animation every few seconds
    setInterval(() => {
        chatbotBtn.style.transform = "translateY(-5px)";
        setTimeout(() => {
            chatbotBtn.style.transform = "translateY(0)";
        }, 300);
    }, 4000);

    // Show chatbox
    chatbotBtn.addEventListener("click", function () {
        chatboxContainer.style.display = "flex";
    });

    // Close chatbox
    closeChatbox.addEventListener("click", function () {
        chatboxContainer.style.display = "none";
    });

    // Function to append messages
    function appendMessage(sender, message) {
        const msgDiv = document.createElement("div");
        msgDiv.innerHTML = `<strong>${sender}:</strong> ${message}`;
        msgDiv.style.marginBottom = "10px";
        chatboxMessages.appendChild(msgDiv);
        chatboxMessages.scrollTop = chatboxMessages.scrollHeight;
    }

    // Function to speak the bot's message
    function speakMessage(message) {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.rate = 1;  // Set the speed of the speech
        synth.speak(utterance);
    }

    // Detect if the user is asking for job recommendations
    function isJobQuery(message) {
        const jobKeywords = ["job", "company", "hiring", "recommendation", "career", "employment"];
        return jobKeywords.some(keyword => message.toLowerCase().includes(keyword));
    }

    // Handle basic conversation
    function handleBasicConversation(message) {
        const basicResponses = {
            "hello": "Hi there! How can I assist you today?",
            "how are you": "I'm doing great, thank you! How about you?",
            "bye": "Goodbye! Have a great day!",
            "thank you": "You're welcome! Let me know if you need further assistance."
        };

        return basicResponses[message.toLowerCase()] || "Sorry, I didn't understand that. Can you please rephrase?";
    }

    // Handle job recommendations
    function getJobRecommendations(skills) {
        const sectors = ["IT", "Healthcare", "Finance", "Engineering", "Marketing"];
        const companies = {
            "IT": ["Google", "Microsoft", "Facebook", "Apple"],
            "Healthcare": ["Pfizer", "Johnson & Johnson", "Medtronic", "GE Healthcare"],
            "Finance": ["Goldman Sachs", "JP Morgan", "Bank of America", "Citigroup"],
            "Engineering": ["Tesla", "GE", "Caterpillar", "Boeing"],
            "Marketing": ["HubSpot", "Deloitte", "WPP", "McKinsey"]
        };

        let recommendedSectors = [];
        if (skills.includes("software") || skills.includes("programming")) {
            recommendedSectors.push("IT");
        }
        if (skills.includes("health") || skills.includes("medicine")) {
            recommendedSectors.push("Healthcare");
        }
        if (skills.includes("finance") || skills.includes("accounting")) {
            recommendedSectors.push("Finance");
        }
        if (skills.includes("engineering") || skills.includes("mechanical")) {
            recommendedSectors.push("Engineering");
        }
        if (skills.includes("marketing") || skills.includes("advertising")) {
            recommendedSectors.push("Marketing");
        }

        let jobSuggestions = `Based on your skills, you could explore jobs in the following sectors: ${recommendedSectors.join(", ")}. Here are some companies that are hiring in these sectors:`;
        recommendedSectors.forEach(sector => {
            jobSuggestions += `<br><strong>${sector}:</strong> ${companies[sector].join(", ")}<br>`;
        });

        return jobSuggestions;
    }

    // Send message to OpenAI API
    async function sendMessage() {
        const userMessage = chatInput.value.trim();
        if (!userMessage) return;

        appendMessage("You", userMessage);
        chatInput.value = "";

        // Show loading message
        const loadingMessage = document.createElement("div");
        loadingMessage.innerHTML = `<strong>Bot:</strong> Typing...`;
        loadingMessage.id = "loading-msg";
        chatboxMessages.appendChild(loadingMessage);
        chatboxMessages.scrollTop = chatboxMessages.scrollHeight;

        // Handle basic conversation first
        const basicResponse = handleBasicConversation(userMessage);
        if (basicResponse !== "Sorry, I didn't understand that. Can you please rephrase?") {
            appendMessage("Bot", basicResponse);
            speakMessage(basicResponse);
            return;
        }

        // If job query, provide recommendations
        if (isJobQuery(userMessage)) {
            const jobRecommendations = getJobRecommendations(userMessage);
            appendMessage("Bot", jobRecommendations);
            speakMessage(jobRecommendations);
            return;
        }

        // Otherwise, send to OpenAI API for generic response
        try {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer YOUR_OPENAI_API_KEY"
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [{ role: "user", content: userMessage }]
                })
            });

            const data = await response.json();
            const botReply = data.choices[0].message.content;

            // Remove loading message
            document.getElementById("loading-msg").remove();
            appendMessage("Bot", botReply);
            speakMessage(botReply);
        } catch (error) {
            // Remove loading message and show error
            document.getElementById("loading-msg").remove();
            appendMessage("Bot", "Sorry, there was an error processing your request.");
        }
    }

    // Send message on button click
    sendBtn.addEventListener("click", sendMessage);

    // Send message on Enter key
    chatInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            sendMessage();
        }
    });

    // Enable voice mode (Voice Input)
    voiceBtn.addEventListener("click", function () {
        recognition.start();
    });

    // Handle Speech Recognition Results
    recognition.addEventListener("result", function (event) {
        const transcript = event.results[event.resultIndex][0].transcript;
        chatInput.value = transcript;
        sendMessage();
    });

    // Handle Speech Recognition errors
    recognition.addEventListener("error", function () {
        alert("Sorry, I couldn't understand your speech. Please try again.");
    });
});
