/* EVM Simulator Interaction Logic */

let isVoted = false;

function castVote(id, name, symbol) {
    if (isVoted) return;
    isVoted = true;

    // 1. Activate LED
    const led = document.getElementById(`led-${id}`);
    if (led) led.classList.add('active');

    // 2. Show BEEP
    const beep = document.getElementById('beep-msg');
    if (beep) beep.classList.add('active');
    
    // Disable Ballot Unit
    const ballotUnit = document.querySelector('.ballot-unit');
    if (ballotUnit) ballotUnit.classList.add('disabled-unit');

    // 3. Print VVPAT Slip
    const slip = document.getElementById('vvpat-slip');
    const slipNum = document.getElementById('slip-num');
    const slipSymbol = document.getElementById('slip-symbol');
    const slipName = document.getElementById('slip-name');

    if (slipNum) slipNum.textContent = id;
    if (slipSymbol) slipSymbol.textContent = symbol;
    if (slipName) slipName.textContent = name;
    
    setTimeout(() => {
        if (slip) slip.classList.add('printing');
    }, 300);

    // 4. Wait 7 seconds then drop
    setTimeout(() => {
        if (slip) {
            slip.classList.remove('printing');
            slip.classList.add('dropping');
        }
        if (beep) beep.classList.remove('active');
        
        const successMsg = document.getElementById('vote-success');
        if (successMsg) successMsg.style.display = 'block';
    }, 7000);
}

function resetEVM() {
    isVoted = false;
    
    const ballotUnit = document.querySelector('.ballot-unit');
    if (ballotUnit) ballotUnit.classList.remove('disabled-unit');
    
    document.querySelectorAll('.led').forEach(l => l.classList.remove('active'));
    
    const slip = document.getElementById('vvpat-slip');
    if (slip) slip.classList.remove('printing', 'dropping');
    
    const successMsg = document.getElementById('vote-success');
    if (successMsg) successMsg.style.display = 'none';
    
    const beep = document.getElementById('beep-msg');
    if (beep) beep.classList.remove('active');
}
