// Adicione ao final do seu arquivo HTML ou em um arquivo JS separado
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