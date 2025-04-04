document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('pdf-files');
    const fileList = document.getElementById('preview-area');
    const searchInput = document.getElementById('searchInput');
    const mergeButton = document.getElementById('merge-button');
    const progressBar = document.getElementById('progress-bar');
    const statusText = document.getElementById('status');

    let pdfFiles = [];

    // Selecionar arquivos
    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            if (file.type === 'application/pdf') {
                pdfFiles.push(file);
                addFileToList(file);
            }
        });
        updateStatus();
    });

    // Adicionar arquivo à lista
    function addFileToList(file) {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <span class="file-name">${file.name}</span>
            <span class="remove-file" data-name="${file.name}">×</span>
        `;
        fileList.appendChild(fileItem);

        // Remover arquivo
        fileItem.querySelector('.remove-file').addEventListener('click', (e) => {
            const fileName = e.target.getAttribute('data-name');
            pdfFiles = pdfFiles.filter(f => f.name !== fileName);
            fileItem.remove();
            updateStatus();
        });
    }

    // Buscar arquivos
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const fileItems = fileList.querySelectorAll('.file-item');
        
        fileItems.forEach(item => {
            const fileName = item.querySelector('.file-name').textContent.toLowerCase();
            item.style.display = fileName.includes(searchTerm) ? 'flex' : 'none';
        });
    });

    // Atualizar status
    function updateStatus() {
        statusText.textContent = `${pdfFiles.length} arquivo(s) selecionado(s)`;
    }

    // Mesclar PDFs
    mergeButton.addEventListener('click', async () => {
        if (pdfFiles.length === 0) {
            alert('Selecione pelo menos um arquivo PDF!');
            return;
        }

        try {
            mergeButton.disabled = true;
            statusText.textContent = 'Enviando arquivos...';
            progressBar.style.width = '0%';

            // Criar FormData para enviar os arquivos
            const formData = new FormData();
            pdfFiles.forEach(file => {
                formData.append('pdfs', file);
            });

            // Enviar para o servidor
            const response = await fetch('/merge', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erro ao mesclar PDFs');
            }

            // Baixar o arquivo
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'PDF_Mesclado.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            statusText.textContent = 'PDFs mesclados com sucesso!';
            progressBar.style.width = '100%';

        } catch (error) {
            console.error('Erro:', error);
            statusText.textContent = error.message;
        } finally {
            mergeButton.disabled = false;
        }
    });
}); 