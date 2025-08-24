document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('grid-container');
    const vendidosCounter = document.getElementById('vendidos');
    const disponiveisCounter = document.getElementById('disponiveis');

    const loginModal = document.getElementById('login-modal');
    const showLoginButton = document.getElementById('show-login-modal');
    const logoutButton = document.getElementById('logout-button');
    const closeButton = document.querySelector('.close-button');
    const passwordInput = document.getElementById('password-input');
    const loginButton = document.getElementById('login-button');

    let isAdminLoggedIn = false;
    const adminPassword = "SUA_SENHA_SEGURA"; // <-- TROQUE A SENHA AQUI!

    const pixKey = "34999893400"; // A chave Pix para copiar

    // Função para copiar a chave Pix
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            alert('Chave Pix copiada para a área de transferência!');
        }).catch(err => {
            console.error('Erro ao copiar a chave Pix: ', err);
            alert('Erro ao copiar a chave Pix. Tente manualmente: ' + text);
        });
    };
    
    document.getElementById('copy-pix-button').addEventListener('click', () => {
        copyToClipboard(pixKey);
    });

    // Funções para controle do modal
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

    // Lógica de login
    loginButton.addEventListener('click', () => {
        if (passwordInput.value === adminPassword) {
            isAdminLoggedIn = true;
            loginModal.style.display = 'none';
            showLoginButton.style.display = 'none';
            logoutButton.style.display = 'block';
            alert('Login de administrador realizado com sucesso!');
            renderRaffle();
        } else {
            alert('Senha incorreta! Tente novamente.');
            passwordInput.value = '';
        }
    });

    // Lógica de logout
    logoutButton.addEventListener('click', () => {
        isAdminLoggedIn = false;
        showLoginButton.style.display = 'block';
        logoutButton.style.display = 'none';
        alert('Logout realizado com sucesso.');
        renderRaffle();
    });

    // Função para buscar os dados da rifa e renderizar a grade
    const renderRaffle = async () => {
        try {
            const response = await fetch('rifa_data.json');
            const rifaData = await response.json();
            gridContainer.innerHTML = '';

            let vendidosCount = 0;
            const totalNumbers = 200; // Altere este valor para o número total de rifas
            
            for (let i = 1; i <= totalNumbers; i++) {
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
                    vendidosCount++;
                } else {
                    if (isAdminLoggedIn) {
                        item.classList.add('editable');
                        item.addEventListener('click', () => {
                            const nome = prompt(`Número ${i} - Quem comprou?`);
                            if (nome) {
                                rifaData[i] = { status: 'vendido', comprador: nome };
                                console.log(JSON.stringify(rifaData, null, 2));
                                alert('Copie o JSON do console para o arquivo rifa_data.json e salve!');
                                renderRaffle();
                            }
                        });
                    }
                }
                gridContainer.appendChild(item);
            }
            
            vendidosCounter.textContent = vendidosCount;
            disponiveisCounter.textContent = totalNumbers - vendidosCount;

        } catch (error) {
            console.error('Erro ao carregar os dados da rifa:', error);
            gridContainer.innerHTML = '<p>Não foi possível carregar os números da rifa. Tente novamente mais tarde.</p>';
        }
    };

    // Chamada inicial para renderizar a rifa
    renderRaffle();

    // Atualiza a página a cada 30 segundos
    setInterval(renderRaffle, 30000);
});
