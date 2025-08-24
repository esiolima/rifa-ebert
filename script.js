document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('grid-container');
    
    // Elementos do pop-up
    const loginModal = document.getElementById('login-modal');
    const showLoginButton = document.getElementById('show-login-modal');
    const closeButton = document.querySelector('.close-button');
    const passwordInput = document.getElementById('password-input');
    const loginButton = document.getElementById('login-button');

    // Variável de controle do estado de login
    let isAdminLoggedIn = false;
    const adminPassword = "SUA_SENHA_SEGURA"; // <-- TROQUE A SENHA AQUI!

    // Função para abrir e fechar o pop-up
    showLoginButton.addEventListener('click', () => {
        loginModal.style.display = 'flex';
    });

    closeButton.addEventListener('click', () => {
        loginModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === loginModal) {
            loginModal.style.display = 'none';
        }
    });

    // Lógica do login
    loginButton.addEventListener('click', () => {
        if (passwordInput.value === adminPassword) {
            isAdminLoggedIn = true;
            loginModal.style.display = 'none';
            alert('Login de administrador realizado com sucesso!');
            renderRaffle(); // Renderiza a grade novamente com a função de administrador habilitada
        } else {
            alert('Senha incorreta! Tente novamente.');
            passwordInput.value = '';
        }
    });

    // Função para buscar os dados da rifa e renderizar a grade
    const renderRaffle = async () => {
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
                    // Adiciona o evento de clique APENAS se o administrador estiver logado
                    if (isAdminLoggedIn) {
                        item.title = `Clique para marcar como vendido`;
                        item.addEventListener('click', () => {
                            const nome = prompt(`Número ${i} - Quem comprou?`);
                            if (nome) {
                                rifaData[i] = { status: 'vendido', comprador: nome };
                                console.log(JSON.stringify(rifaData, null, 2));
                                alert('Copie o JSON do console para o arquivo rifa_data.json e salve!');
                                renderRaffle(); // Atualiza a visualização
                            }
                        });
                    }
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
