/* Home Page Interaction Logic */

document.addEventListener('DOMContentLoaded', function() {
    const stateSelect = document.getElementById('stateSelectHome');
    const districtSelect = document.getElementById('districtSelectHome');
    const repDisplay = document.getElementById('repDisplay');

    const stateLanguages = {
        'Maharashtra': 'mr', 'Tamil Nadu': 'ta', 'West Bengal': 'bn', 'Gujarat': 'gu',
        'Karnataka': 'kn', 'Kerala': 'ml', 'Punjab': 'pa', 'Odisha': 'or',
        'Andhra Pradesh': 'te', 'Telangana': 'te', 'Assam': 'as',
        'Bihar': 'hi', 'Uttar Pradesh': 'hi', 'Madhya Pradesh': 'hi', 'Rajasthan': 'hi',
        'Haryana': 'hi', 'Himachal Pradesh': 'hi', 'Delhi': 'hi', 'Jharkhand': 'hi',
        'Chhattisgarh': 'hi', 'Uttarakhand': 'hi'
    };

    if (stateSelect) {
        stateSelect.addEventListener('change', async function() {
            const stateId = this.value;
            const stateText = this.options[this.selectedIndex].text;
            
            // Set preferred language for translation feature
            if (stateLanguages[stateText]) {
                localStorage.setItem('preferredLanguage', stateLanguages[stateText]);
            }

            districtSelect.innerHTML = '<option value="">Select District</option>';
            districtSelect.disabled = true;
            if (!stateId) return;

            try {
                const response = await fetch(`/api/districts/?state_id=${stateId}`);
                const data = await response.json();
                data.forEach(d => {
                    const opt = document.createElement('option');
                    opt.value = d.id;
                    opt.textContent = d.name;
                    districtSelect.appendChild(opt);
                });
                districtSelect.disabled = false;
            } catch (e) { 
                console.error('Error loading districts:', e); 
            }
        });
    }

    if (districtSelect) {
        districtSelect.addEventListener('change', async function() {
            const stateText = stateSelect.options[stateSelect.selectedIndex].text;
            const districtText = districtSelect.options[districtSelect.selectedIndex].text;
            
            if (!repDisplay) return;

            repDisplay.style.display = 'block';
            repDisplay.innerHTML = `
                <div class="glassCard loading-state">
                    <div class="loading-pulse" style="color: var(--accent-cyan); font-weight: 600;">🔍 Identifying your representatives via AI engine...</div>
                </div>
            `;
            
            // Scroll to the display area
            repDisplay.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            try {
                const response = await fetch(`/api/ai-constituency/?state=${encodeURIComponent(stateText)}&district=${encodeURIComponent(districtText)}`);
                const data = await response.json();
                
                if (data.error) throw new Error(data.error);

                repDisplay.innerHTML = `
                    <div class="glassCard rep-result-container">
                        <div class="rep-live-badge">Live Data</div>
                        
                        <h3 style="text-align: center; margin-bottom: 2rem; color: var(--text-main); font-size: 1.4rem;">Your Local Representatives</h3>
                        
                        <div class="rep-grid">
                            <!-- MLA Card -->
                            <div class="glassCard rep-card">
                                <span class="rep-label">MLA (Assembly)</span>
                                <div class="rep-name">${data.mla_name}</div>
                                <div class="rep-party">${data.mla_party}</div>
                                <div class="rep-constituency">Constituency: ${data.assembly_constituency}</div>
                            </div>
                            
                            <!-- MP Card -->
                            <div class="glassCard rep-card mp">
                                <span class="rep-label">MP (Parliament)</span>
                                <div class="rep-name">${data.mp_name}</div>
                                <div class="rep-party">${data.mp_party}</div>
                                <div class="rep-constituency">Constituency: ${data.parliamentary_constituency}</div>
                            </div>
                        </div>
                        
                        <div class="ai-engine-footer">✨ Powered by Gemini Flash Engine</div>
                    </div>
                `;
            } catch (e) {
                console.error('AI Lookup Error:', e);
                repDisplay.innerHTML = `
                    <div class="glassCard error-state">
                        Sorry, we couldn't identify your representatives right now. Please try again.
                    </div>
                `;
            }
        });
    }
});
