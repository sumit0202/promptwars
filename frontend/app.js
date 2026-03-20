document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('input-form');
    const userInput = document.getElementById('user-input');
    const submitBtn = document.getElementById('submit-btn');
    
    const loading = document.getElementById('loading');
    const emptyState = document.getElementById('empty-state');
    const results = document.getElementById('results');
    const copyBtn = document.getElementById('copy-btn');
    const jsonContainer = document.getElementById('json-container');
    const jsonOutput = document.getElementById('json-output');

    // UI Elements for mapping
    const riskBanner = document.getElementById('risk-banner');
    const intentVal = document.getElementById('intent-val');
    const riskVal = document.getElementById('risk-val');
    const locVal = document.getElementById('loc-val');
    const issueVal = document.getElementById('issue-val');
    const actionsList = document.getElementById('actions-list');
    const authoritiesList = document.getElementById('authorities-list');

    // Test cases filling
    const testCases = {
        'Fire building': "There is a fire in my building, second floor is covered in smoke.",
        'Chest pain': "My father has chest pain and sweating heavily.",
        'Flood water': "Flood water rising near my house, we are trapped.",
        'Stolen wallet': "Someone stole my wallet on the train."
    };

    document.querySelectorAll('.test-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const type = e.target.textContent;
            userInput.value = testCases[type] || "";
            userInput.focus();
        });
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const text = userInput.value.trim();
        if (!text) return;

        // UI Loading State
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        
        emptyState.classList.add('hidden');
        results.classList.add('hidden');
        jsonContainer.classList.add('hidden');
        copyBtn.classList.add('hidden');
        loading.classList.remove('hidden');
        loading.style.display = 'flex';

        try {
            const response = await fetch('/api/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userInput: text })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to process request');
            }

            const data = await response.json();
            
            // Render UI
            renderResults(data);
            
            // Render JSON
            jsonOutput.textContent = JSON.stringify(data, null, 2);
            jsonContainer.classList.remove('hidden');
            copyBtn.classList.remove('hidden');

            // Hide Loading, Show Results
            loading.classList.add('hidden');
            loading.style.display = '';
            results.classList.remove('hidden');
            results.style.display = 'flex';
            
        } catch (error) {
            console.error('Error:', error);
            alert(`An error occurred: ${error.message}`);
            
            // Go back to empty state on error
            loading.classList.add('hidden');
            loading.style.display = '';
            emptyState.classList.remove('hidden');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Analyze Situation';
        }
    });

    // Copy JSON logic
    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(jsonOutput.textContent).then(() => {
            const originalHTML = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-check text-green-500"></i> Copied!';
            setTimeout(() => {
                copyBtn.innerHTML = originalHTML;
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy', err);
        });
    });

    function renderResults(data) {
        // Set Intent & Risk levels
        intentVal.textContent = data.intent ? data.intent.replace(/_/g, ' ') : 'Unknown';
        
        const risk = (data.risk_level || 'low').toLowerCase();
        riskVal.textContent = risk;
        
        // Reset risk banner styles
        riskBanner.className = 'flex items-center justify-between p-4 rounded-xl text-white transition-all';
        
        if (risk === 'high') {
            riskBanner.classList.add('bg-red-600');
        } else if (risk === 'medium') {
            riskBanner.classList.add('bg-orange-500');
        } else {
            riskBanner.classList.add('bg-blue-500');
        }

        // Set Entities
        locVal.textContent = data.entities?.location || 'Not specified';
        issueVal.textContent = data.entities?.issue || 'Not specified';

        // Set Actions
        actionsList.innerHTML = '';
        if (data.actions && data.actions.length > 0) {
            data.actions.forEach(action => {
                const li = document.createElement('li');
                li.textContent = action;
                actionsList.appendChild(li);
            });
        } else {
            actionsList.innerHTML = '<li class="text-gray-400 italic">No specific actions recommended.</li>';
        }

        // Set Authorities
        authoritiesList.innerHTML = '';
        if (data.authorities && data.authorities.length > 0) {
            data.authorities.forEach(auth => {
                const span = document.createElement('span');
                span.className = 'bg-gray-200 text-gray-800 text-xs font-bold px-3 py-1 rounded-full border border-gray-300 flex items-center gap-1';
                span.innerHTML = `<i class="fas fa-phone-alt opacity-70"></i> ${auth}`;
                authoritiesList.appendChild(span);
            });
        } else {
            authoritiesList.innerHTML = '<span class="text-gray-400 italic text-sm">None identified.</span>';
        }
    }
});
