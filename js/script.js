document.addEventListener('DOMContentLoaded', function() {
    const boxes = document.querySelectorAll('.box');
    
    boxes.forEach(box => {
        const expandBtn = box.querySelector('.expand-btn');
        expandBtn.addEventListener('click', function() {
            box.classList.toggle('expanded');
            
            const arrow = expandBtn.querySelector('.arrow');
            if (box.classList.contains('expanded')) {
                arrow.classList.remove('down');
                arrow.classList.add('up');
            } else {
                arrow.classList.remove('up');
                arrow.classList.add('down');
            }
        });
    });
});

document.getElementById("today").innerHTML = "Hoje - " + new Date().toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
}).replace(/\//g, '/');