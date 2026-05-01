/* Constituency Lookup Interaction Logic */

document.addEventListener('DOMContentLoaded', function() {
    const stateSelect = document.getElementById('stateSelect');
    const districtSelect = document.getElementById('districtSelect');
    const resultsArea = document.getElementById('resultsArea');
    const constituencyList = document.getElementById('constituencyList');
    const mapContainer = document.getElementById('googleMapContainer');
    const googleMap = document.getElementById('googleMap');

    if (!stateSelect || !districtSelect) return;

    stateSelect.addEventListener('change', async function() {
        const stateId = this.value;
        districtSelect.innerHTML = '<option value="">-- Choose District --</option>';
        districtSelect.disabled = true;
        
        if (resultsArea) resultsArea.style.display = 'none';
        if (mapContainer) mapContainer.style.display = 'none';

        if (!stateId) return;

        try {
            const response = await fetch(`/api/districts/?state_id=${stateId}`);
            const data = await response.json();

            if (data.length > 0) {
                data.forEach(district => {
                    const option = document.createElement('option');
                    option.value = district.id;
                    option.textContent = district.name;
                    districtSelect.appendChild(option);
                });
                districtSelect.disabled = false;
            }
        } catch (error) {
            console.error('Error fetching districts:', error);
        }
    });

    districtSelect.addEventListener('change', async function() {
        const districtId = this.value;
        if (!constituencyList) return;

        constituencyList.innerHTML = `
            <p class="search-message">🔍 Searching for constituencies and representatives...</p>
        `;
        
        if (resultsArea) resultsArea.style.display = 'block';
        if (mapContainer) mapContainer.style.display = 'none';

        if (!districtId) return;

        try {
            const response = await fetch(`/api/constituencies/?district_id=${districtId}`);
            const data = await response.json();

            constituencyList.innerHTML = ''; 
            if (data.length > 0) {
                data.forEach(constituency => {
                    const card = document.createElement('div');
                    card.className = 'constituency-card';
                    
                    const typeClass = constituency.constituency_type === 'Assembly' ? 'type-assembly' : 'type-parliamentary';
                    
                    let cardHtml = `
                        <div class="c-type ${typeClass}">${constituency.constituency_type}</div>
                        <div class="c-name">${constituency.name}</div>
                    `;

                    if (constituency.representative) {
                        cardHtml += `
                            <div class="c-info-label">Current ${constituency.constituency_type === 'Assembly' ? 'MLA' : 'MP'}</div>
                            <div class="c-rep">${constituency.representative}</div>
                        `;
                    }

                    if (constituency.party) {
                        cardHtml += `
                            <div class="c-info-label">Party</div>
                            <div class="c-party">${constituency.party}</div>
                        `;
                    }

                    if (constituency.is_ai) {
                        cardHtml += `
                            <div class="ai-badge">✨ AI Generated Information</div>
                        `;
                        card.classList.add('ai-enhanced');
                    }

                    card.innerHTML = cardHtml;
                    constituencyList.appendChild(card);
                });
                
                if (resultsArea) resultsArea.style.display = 'block';
                
                // Update Google Map
                const districtText = districtSelect.options[districtSelect.selectedIndex].text;
                const stateText = stateSelect.options[stateSelect.selectedIndex].text;
                const query = encodeURIComponent(`${districtText}, ${stateText}, India`);
                
                if (googleMap) {
                    googleMap.src = `https://maps.google.com/maps?q=${query}&t=&z=10&ie=UTF8&iwloc=&output=embed`;
                    if (mapContainer) mapContainer.style.display = 'block';
                }

            } else {
                constituencyList.innerHTML = '<p style="color: var(--text-color); grid-column: 1/-1;">No constituencies found for this district.</p>';
                if (resultsArea) resultsArea.style.display = 'block';
            }
        } catch (error) {
            console.error('Error fetching constituencies:', error);
            constituencyList.innerHTML = '<p style="color: #ef4444; grid-column: 1/-1;">Error loading data. Please try again.</p>';
        }
    });
});
