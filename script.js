document.getElementById('mcq-form').addEventListener('submit', async function (event) {
    event.preventDefault();

    const topic = document.getElementById('topic').value;
    const difficulty = document.getElementById('difficulty').value;
    const noofquestions = document.getElementById('noofquestions').value;
    const noofsets = document.getElementById('noofsets').value;
    const totalquestions = noofquestions * noofsets;
    const questionsContainer = document.getElementById('questions-container');

    questionsContainer.innerHTML = '<p>Loading questions...</p>';

    try {
        const response = await fetch('http://localhost:3000/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic, difficulty, totalquestions })
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.statusText}`);
        }

        const questions = await response.json();

        questionsContainer.innerHTML = '';

        const allAnswers = [];
        const questionsPerSet = Math.floor(totalquestions / noofsets);

        for (let setIndex = 0; setIndex < noofsets; setIndex++) {
            const setDiv = document.createElement('div');
            setDiv.classList.add('set-container');
            setDiv.innerHTML = `<h2>Set ${setIndex + 1}</h2>`;

            const currentSetQuestions = questions.slice(setIndex * questionsPerSet, (setIndex + 1) * questionsPerSet);
            currentSetQuestions.forEach((q, index) => {
                const questionDiv = document.createElement('div');
                questionDiv.classList.add('question');
                questionDiv.innerHTML = `<h3>Q${setIndex * questionsPerSet + index + 1}: ${q.question}</h3>`;

                const optionsList = document.createElement('ul');
                q.options.forEach(option => {
                    const optionItem = document.createElement('li');
                    optionItem.textContent = option;
                    optionItem.setAttribute('data-correct', option === q.answer);
                    optionsList.appendChild(optionItem);
                });

                questionDiv.appendChild(optionsList);
                setDiv.appendChild(questionDiv);
                allAnswers.push(`Q${setIndex * questionsPerSet + index + 1}: ${q.answer}`);
            });

            questionsContainer.appendChild(setDiv);
        }

        const downloadButton = document.getElementById('download-pdf-btn');
        downloadButton.style.display = 'block';
        downloadButton.addEventListener('click', () => generatePDF(questionsContainer.innerHTML, allAnswers));
    } catch (error) {
        questionsContainer.innerHTML = `<p class="error">Error: ${error.message}</p>`;
    }
});

function generatePDF(questionsHTML, answers) {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    pdf.text('MCQs', 10, 10);
    pdf.html(document.body, { callback: pdf => pdf.save('mcqs.pdf') });
}
