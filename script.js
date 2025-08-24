document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('grid-container');

    // Função para buscar os dados da rifa e renderizar a grade
    const renderRaffle = async () => {
        try {
            const response = await fetch('rifa_data.json');
            const rifaData = await response.json();

            // Limpa o conteúdo da grade para renderizar novamente
            gridContainer.innerHTML = '';

            for (let i = 1; i <= 200; i++) {
                const item = document.createElement('div');
                item.classList.add('grid-item');
                item.textContent = i;

                if (rifaData[i] && rifaData[i].status === 'vendido') {
                    item.classList.add('sold');
                    const compradorNome = document.createElement('span');
                    compradorNome.classList.add('comprador');
                    compradorNome.textContent = rifaData[i].comprador;
                    item.appendChild(document.createElement('br'));
                    item.appendChild(compradorNome);
                }

                gridContainer.appendChild(item);
            }
        } catch (error) {
            console.error('Erro ao carregar os dados da rifa:', error);
            gridContainer.innerHTML = '<p>Não foi possível carregar os números da rifa. Tente novamente mais tarde.</p>';
        }
    };

    // Chamada inicial para renderizar a rifa
    renderRaffle();

    // Atualiza a página a cada 30 segundos para mostrar os números vendidos
    setInterval(renderRaffle, 30000);
});