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
    const adminPassword = "PimentaCancadoLima";

    const pixKey = "34999893400";

    // Informações do seu JSONBin (SUBSTITUA SOMENTE ESTES DOIS VALORES!)
    const binId = "SEU_BIN_ID_AQUI"; 
    const masterKey = "SEU_MASTER_KEY_AQUI"; 

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

    // Função para atualizar os dados no JSONBin.io
    const updateRaffleData = async (newData) => {
        const url = `https://api.jsonbin.io/v3/b/${binId}`;
        
        try {
            const updateResponse = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': masterKey,
                    'X-Bin-Versioning': false
                },
                body: JSON.stringify({ numbers: newData })
            });

            if (updateResponse.ok) {
                console.log('Dados atualizados com sucesso no JSONBin.io!');
                renderRaffle();
            } else {
                console.error('Erro ao atualizar o arquivo:', updateResponse.statusText);
                alert('Erro ao atualizar o arquivo. Tente novamente.');
            }

        } catch (error) {
            console.error('Erro na requisição para o JSONBin.io:', error);
            alert('Erro de conexão com o JSONBin.io. Verifique sua internet ou chaves.');
        }
    };

    // Função para buscar os dados da rifa e renderizar a grade
    const renderRaffle = async () => {
        try {
            const url = `https://api.jsonbin.io/v3/b/${binId}`;
            const response = await fetch(url, {
                headers: {
                    'X-Master-Key': masterKey
                }
            });
            const data = await response.json();
            const rifaData = data.record.numbers;

            gridContainer.innerHTML = '';

            let vendidosCount = 0;
            const totalNumbers = 200;
            
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
                }

                if (isAdminLoggedIn) {
                    item.classList.add('editable');
                    item.addEventListener('click', () => {
                        if (rifaData[i] && rifaData[i].status === 'vendido') {
                            const action = prompt(`Número ${i} - Já vendido para "${rifaData[i].comprador}". Digite 'A' para Alterar ou 'P' para Apagar:`);
                            if (action && action.toLowerCase() === 'a') {
                                const novoNome = prompt(`Alterar o nome do comprador do número ${i}. Digite o novo nome:`);
                                if (novoNome) {
                                    rifaData[i].comprador = novoNome;
                                    updateRaffleData(rifaData);
                                }
                            } else if (action && action.toLowerCase() === 'p') {
                                if (confirm(`Tem certeza que deseja apagar o nome do comprador do número ${i}?`)) {
                                    delete rifaData[i];
                                    updateRaffleData(rifaData);
                                }
                            }
                        } else {
                            const nome = prompt(`Número ${i} - Quem comprou?`);
                            if (nome) {
                                rifaData[i] = { status: 'vendido', comprador: nome };
                                updateRaffleData(rifaData);
                            }
                        }
                    });
                }
                
                gridContainer.appendChild(item);
            }
            
            vendidosCounter.textContent = vendidosCount;
            disponiveisCounter.textContent = totalNumbers - vendidosCount;

        } catch (error) {
            console.error('Erro ao carregar os dados da rifa:', error);
            gridContainer.innerHTML = '<p>Não foi possível carregar os números da rifa. Verifique se o ID e a chave do JSONBin estão corretos.</p>';
        }
    };

    renderRaffle();
    setInterval(renderRaffle, 30000);
});
