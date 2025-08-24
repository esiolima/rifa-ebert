document.addEventListener('DOMContentLoaded', () => {
    const loginScreen = document.getElementById('login-screen');
    const adminContent = document.getElementById('admin-content');
    const passwordInput = document.getElementById('password-input');
    const loginButton = document.getElementById('login-button');
    const gridContainer = document.getElementById('grid-container');

    const adminPassword = "SUA_SENHA_SEGURA"; // <-- TROQUE A SENHA AQUI!

    loginButton.addEventListener('click', () => {
        if (passwordInput.value === adminPassword) {
            loginScreen.style.display = 'none';
            adminContent.style.display = 'block';
            renderAdminRaffle(); // Apenas renderiza a grade após o login
        } else {
            alert('Senha incorreta! Tente novamente.');
            passwordInput.value = '';
        }
    });

    // Função para renderizar a grade e permitir a edição
    const renderAdminRaffle = async () => {
        try {
            const response = await fetch('rifa_data.json');
            const rifaData = await response.json();

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
                    item.title = `Vendido para: ${rifaData[i].comprador}`;
                } else {
                    item.title = `Clique para marcar como vendido`;
                    item.addEventListener('click', () => {
                        const nome = prompt(`Número ${i} - Quem comprou?`);
                        if (nome) {
                            rifaData[i] = { status: 'vendido', comprador: nome };
                            console.log(JSON.stringify(rifaData, null, 2));
                            alert('Copie o JSON do console para o arquivo rifa_data.json e salve!');
                            renderAdminRaffle(); // Atualiza a visualização
                        }
                    });
                }
                gridContainer.appendChild(item);
            }
        } catch (error) {
            console.error('Erro ao carregar os dados da rifa:', error);
            gridContainer.innerHTML = '<p>Não foi possível carregar os números da rifa.</p>';
        }
    };
});