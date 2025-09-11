document.addEventListener('DOMContentLoaded', () => {
    const emailForm = document.getElementById('email-form');

    if (emailForm) {
        emailForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const to = document.getElementById('to').value;
            const from = document.getElementById('from').value;
            const subject = document.getElementById('subject').value;
            const body = document.getElementById('body').value;

            const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}&replyto=${encodeURIComponent(from)}`;

            window.location.href = mailtoLink;
        });
    }
});
