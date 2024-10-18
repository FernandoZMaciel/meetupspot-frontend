const searchInput = document.querySelector('.city-search');
const uf_select = document.querySelector(".select-uf");
const uf_options_list = document.querySelector(".uf-options-list");
const uf_options = document.querySelectorAll(".uf-option");
const image = document.querySelector(".img-city-box");

const ct_select = document.querySelector(".select-ct");
const ct_options_list = document.querySelector(".ct-options-list");
const add_button = document.getElementById("add-button");

let selectedUF = null;
let selectedCity = null;

uf_select.addEventListener("click", () => {
    const isActive = uf_options_list.classList.contains("active");
    if (isActive) {
        searchInput.value = '';
        const options = ct_options_list.querySelectorAll('.ct-option');
        options.forEach(option => option.style.display = '');

        uf_options_list.classList.remove("active");
        uf_select.querySelector(".fa-angle-down").classList.remove("fa-angle-up");

        ct_select.classList.add('disabled');
        ct_select.classList.remove('enabled');
        add_button.classList.add('disabled');
        add_button.classList.remove('enabled');
        add_button.disabled = true;
    } else {
        uf_options_list.classList.add("active");
        uf_select.querySelector(".fa-angle-down").classList.add("fa-angle-up");
    }
});

uf_options.forEach((uf_option) => {
    uf_option.addEventListener("click", async () => {
        uf_options.forEach((uf_option) => { uf_option.classList.remove('selected') });
        uf_select.querySelector("span").innerHTML = uf_option.innerHTML;
        uf_option.classList.add("selected");

        selectedUF = uf_option.innerHTML;  
        await updateCitiesList(selectedUF);

        ct_select.classList.remove('disabled');
        ct_select.classList.add('enabled');
        uf_options_list.classList.remove("active");
        uf_select.querySelector(".fa-angle-down").classList.remove("fa-angle-up");
        ct_select.querySelector("span").innerHTML = "Selecione sua cidade!";
    });
});

ct_select.addEventListener("click", () => {
    if (selectedUF) {  
        const isActive = ct_options_list.classList.contains("active");
        if (isActive) {
            searchInput.value = '';
            const options = ct_options_list.querySelectorAll('.ct-option');
            options.forEach(option => option.style.display = '');
        }
        ct_options_list.classList.toggle("active");
        ct_select.querySelector(".fa-angle-down").classList.toggle("fa-angle-up");
        searchInput.focus();
    }
});

const updateCitiesList = async (uf) => {
    ct_options_list.innerHTML = '';
    searchInput.value = ''; 

    try {
        const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`);
        const data = await response.json();

        if (data && Array.isArray(data)) {
            data.forEach(city => {
                const div = document.createElement('div');
                div.classList.add('ct-option');
                div.innerText = city.nome;
                div.dataset.cityName = city.nome; 
                div.addEventListener('click', () => {
                    ct_options_list.querySelectorAll('.ct-option').forEach(option => option.classList.remove('selected'));
                    div.classList.add('selected');
                    ct_select.querySelector('span').innerText = div.innerText;

                    selectedCity = div.innerText;

                    searchInput.value = '';
                    const options = ct_options_list.querySelectorAll('.ct-option');
                    options.forEach(option => option.style.display = '');

                    ct_options_list.classList.remove('active');
                    ct_select.querySelector('.fa-angle-down').classList.remove('fa-angle-up');

                    add_button.classList.toggle('disabled', false);  
                    add_button.classList.toggle('enabled', true);    
                    add_button.disabled = false;
                });
                ct_options_list.appendChild(div);
            });

            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase();
                const options = ct_options_list.querySelectorAll('.ct-option');
                const citySpan = ct_select.querySelector("span");
                citySpan.innerHTML = e.target.value;
                options.forEach(option => {
                    const cityName = option.dataset.cityName.toLowerCase();
                    if (cityName.includes(query)) {
                        option.style.display = '';
                    } else {
                        option.style.display = 'none';
                    }
                });
            });
        } else {
            console.error('Data is not in the expected format.');
        }
    } catch (error) {
        console.error('Error fetching cities:', error);
    }
};

const resetInterface = () => {
    selectedUF = null;
    selectedCity = null;
    uf_select.querySelector("span").innerHTML = "UF";
    uf_options.forEach((uf_option) => { uf_option.classList.remove('selected') });
    ct_select.querySelector("span").innerHTML = "Selecione sua cidade!";
    ct_options_list.innerHTML = '';

    ct_select.classList.add('disabled');
    ct_select.classList.remove('enabled');
    add_button.classList.add('disabled');
    add_button.classList.remove('enabled');
    add_button.disabled = true;
};

ct_select.classList.add('disabled');
ct_select.classList.remove('enabled');
add_button.classList.add('disabled');
add_button.classList.remove('enabled');
add_button.disabled = true;

add_button.addEventListener('click', () => {
    uf_options_list.classList.remove("active");
    ct_options_list.classList.remove("active");
    uf_select.querySelector(".fa-angle-down").classList.remove("fa-angle-up");
    ct_select.querySelector(".fa-angle-down").classList.remove("fa-angle-up");

    if (selectedCity && selectedUF) {
        addCityToList(selectedCity, selectedUF);
    }

    resetInterface();
});

function addCityToList(city, uf) {
    const newItem = document.createElement('li');

    newItem.innerHTML = `${city}, ${uf} <i class="bx bx-x remove-btn"></i>`;

    newItem.querySelector('.remove-btn').addEventListener('click', function () {
        newItem.remove();
        updateButtonVisibility();
    });

    const list = document.querySelector('.tb-cities');

    list.appendChild(newItem);
    updateButtonVisibility();
}

function updateButtonVisibility() {
    const ul = document.querySelector('.tb-cities');
    const button = document.getElementById('calculate-button');
    const liItems = ul.querySelectorAll('li');

    if (liItems.length >= 3) {
        button.style.opacity = 1; 
        button.style.cursor = 'pointer';
    } else {
        button.style.opacity = 0; 
        button.style.cursor = 'default';
    }
}

const button = document.getElementById('calculate-button');
button.addEventListener('click', () => {
    if (button.disabled == false) {
        fetchCoordinates();
        
    }
}
);

function logListItems() {
    const ul = document.querySelector('.tb-cities');
    const liItems = ul.querySelectorAll('li');
    const apiUrl = buildUrlWithParams(liItems);
    fetchCoordinates(apiUrl);

}

const baseUrl = 'http://localhost:8080/coordinates/meetup-spot';

function buildUrlWithParams(list) {
    const params = list.map(item => `request=${encodeURIComponent(item)}`).join('&');
    return `${baseUrl}?${params}`;
}

function fetchCoordinates() {
    document.documentElement.style.cursor = 'wait';
    const ul = document.querySelector('.tb-cities');
    const liItems = ul.querySelectorAll('li');

    const citiesList = Array.from(liItems).map(li => li.textContent.trim());

    const apiUrl = buildUrlWithParams(citiesList);

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            const destinationName = data.travelDTOList[0].destination.name;  
            const totalDistance = data.totalDistance;
            const totalDuration = data.totalDuration;
            document.querySelector(".chosen-city span").innerHTML = destinationName;
            console.log("Destination Name:", destinationName);
            console.log("Total Distance:", totalDistance);
            console.log("Total Duration:", totalDuration);


            const tableBody = document.getElementById('table-body');

            data.travelDTOList.forEach(travel => {
                const row = document.createElement('tr');
                const originCell = document.createElement('td');
                const distanceCell = document.createElement('td');
                const durationCell = document.createElement('td');

                originCell.textContent = travel.origin.name;
                distanceCell.textContent = convertDistance(travel.distance);
                durationCell.textContent = convertDuration(travel.duration);

                row.appendChild(originCell);
                row.appendChild(distanceCell);
                row.appendChild(durationCell);

                tableBody.appendChild(row);
            });


            updateCityDescription(destinationName);
            Promise.all([
                searchCityImage(destinationName),
            ]).then(() => {
                var section = document.querySelector('.city-section');
                var logSection = document.querySelector('.log-section');
                setTimeout(function() {
                    section.style.display = 'flex'; 
                    logSection.style.display = 'flex';
                    section.scrollIntoView({ behavior: 'smooth' });
                    document.querySelector('.box-cities').style.borderBottomRightRadius = '30px';
                    document.querySelector('.box-cities').style.borderBottomLeftRadius = '30px';
                    showCitySection();
                    document.documentElement.style.cursor = 'auto';
                }, 500);
                
            }).catch(error => {
                console.error('Erro ao atualizar a seção:', error);
            });
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });

}

function searchCityImage(cityName) {
    var myHeaders = new Headers();
    myHeaders.append("X-API-KEY", "adb276e8eb94dd7e2799ec8da60a6521c26f9c5d");
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
        "q": cityName,
        "gl": "br",
        "hl": "pt-br",
        "num": 1 
    });

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    fetch("https://google.serper.dev/images", requestOptions)
        .then(response => response.json())
        .then(result => {
            if (result.images && result.images.length > 0) {
                var imageUrl = result.images[0].imageUrl; 
                document.getElementById('cityImage').src = imageUrl;
            } else {
                console.log('Nenhuma imagem encontrada para a cidade fornecida.');
            }
        })
        .catch(error => console.log('Error:', error));  
}






async function updateCityDescription(city) {
    const OPENROUTER_API_KEY = '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';
    const chatPrompt = `Dê uma descrição em português (Brasil), com no mínimo 400 e no máximo 800 caracteres, explicando de forma envolvente por que visitar a cidade de ${city}. Inclua no texto o nome da cidade e pelo menos dois pontos turísticos, destacando-os dentro da tag <span>. Responda apenas com o texto solicitado, sem informações adicionais.`;
    const url = 'https://openrouter.ai/api/v1/chat/completions';
    const options = {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'meta-llama/llama-guard-2-8b',
            messages: [
                { role: 'user', content: chatPrompt }
            ]
        })
    };
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log(data);

        const description = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content
            ? data.choices[0].message.content.trim()
            : 'Mensagem não disponível';

        const cityDescription = document.querySelector('#city-description');
        cityDescription.innerHTML = description;
        cityDescription.classList.add('fade-in');

    } catch (error) {
        console.error('Error:', error);
        document.getElementById('city-description').textContent = 'Erro ao obter mensagem';
    }
}


function showCitySection() {
    const citySection = document.querySelector('.city-section');
    const spotBox = document.querySelector('.spot-box');
    const chosenCity = document.querySelector('.chosen-city');
    const chosenCitySpan = document.querySelector('.chosen-city span');
    const cityImage = document.querySelector('#cityImage');
    
    citySection.style.display = 'flex';
    
    setTimeout(() => {
        spotBox.classList.add('fade-in');
    }, 400); 
    setTimeout(() => {
        chosenCity.classList.add('fade-in');
    }, 800); 

    setTimeout(() => {
        chosenCitySpan.classList.add('fade-in');
    }, 1100); 

    setTimeout(() => {
        cityImage.classList.add('fade-in');
    }, 1600); 
}

function convertDistance(meters) {
    return (meters / 1000).toFixed(2) + ' km';
}

function convertDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
}


document.addEventListener("DOMContentLoaded", function() {
    function resetToDefault() {
        document.querySelector(".slogan-box").style.opacity = 0;
        document.querySelector(".logo img").style.opacity = 0;
        document.querySelector(".entry-box").style.opacity = 0;
        document.querySelector(".box-cities").style.opacity = 0;
        document.querySelector('.box-cities').style.borderBottomRightRadius = '0px';
        document.querySelector('.box-cities').style.borderBottomLeftRadius = '0px';
        document.querySelector("#calculate-button").style.opacity = 0;
        document.querySelector(".city-search").style.opacity = 0;
        document.querySelector(".city-section").style.display = "none";
        document.querySelector(".spot-box").style.opacity = 0;
        document.querySelector(".log-section").style.display = "none";

        document.querySelector(".entry-box").style.opacity = 0;
        document.querySelector(".box-cities").style.height = "0%";
        document.querySelector(".box-cities").style.opacity = 0;
        document.querySelector(".tb-cities").innerHTML = ""; 
        document.querySelector("#city-description").style.opacity = 0;

        document.querySelector(".uf-select-menu").style.display = "block";
        document.querySelector(".ct-select-menu").style.display = "block";
        document.querySelector(".city-search").value = "";
        document.getElementById('table-body').innerHTML = '';v
    }

    document.querySelector("#back-button").addEventListener("click", function() {
        resetToDefault();
    });
});