
const COMPATIBILITY_RULES = {

    cpuToMotherboard: {
        "AM5": ["Z790", "B650", "X670"],
        "AM4": ["B550", "X570", "B450", "X470"],
        "LGA 1700": ["Z790", "Z690", "B660", "H670"],
        "LGA 1200": ["Z590", "Z490", "B560", "H570"],
    },

    ramToMotherboard: {
        "DDR5": ["4x DDR5", "2x DDR5"],
        "DDR4": ["4x DDR4", "2x DDR4"],
    },

    gpuToPsu: {
        "NVIDIA RTX 4060": 550,
        "NVIDIA RTX 4070": 650,
        "NVIDIA RTX 4080": 750,
        "NVIDIA RTX 4090": 850,
        "AMD RX 7600": 550,
        "AMD RX 7700 XT": 700,
        "AMD RX 7800 XT": 700,
        "AMD RX 7900 XTX": 800,
    },

    coolerSockets: {
        "Noctua NH-D15": ["AM4", "AM5", "LGA 1700", "LGA 1200"],
        "Corsair iCUE H100i RGB": ["AM4", "AM5", "LGA 1700"],
        "be quiet! Dark Rock Pro 4": ["AM4", "AM5", "LGA 1700", "LGA 1200"],
        "NZXT Kraken X63": ["AM4", "AM5", "LGA 1700", "LGA 1200"],
        "Cooler Master Hyper 212 RGB": ["AM4", "AM5", "LGA 1700", "LGA 1200"],
        "Corsair H150i Elite Capellix": ["AM4", "AM5", "LGA 1700"],
        "Deepcool Gammaxx 400": ["AM4", "LGA 1700"],
        "Arctic Liquid Freezer II 280": ["AM4", "AM5", "LGA 1700", "LGA 1200"],
    },

    storageToMotherboard: {
        "NVMe SSD": "M.2",
        "SATA SSD": "SATA",
        "HDD": "SATA",
    }
};

function getCpuSocket(cpuName) {
    if (!cpuName || cpuName === 'None Selected') return null;

    if (cpuName.includes('Ryzen') && (cpuName.includes('7600') || cpuName.includes('7950') || cpuName.includes('7900') || cpuName.includes('7700'))) {
        return 'AM5';
    }
    if (cpuName.includes('Ryzen') && (cpuName.includes('5600') || cpuName.includes('5800') || cpuName.includes('5900') || cpuName.includes('3600'))) {
        return 'AM4';
    }
    if (cpuName.includes('i7-14') || cpuName.includes('i9-14') || cpuName.includes('i5-14') || cpuName.includes('i7-13') || cpuName.includes('i9-13') || cpuName.includes('i7-12') || cpuName.includes('i9-12')) {
        return 'LGA 1700';
    }
    if (cpuName.includes('i7-11') || cpuName.includes('i9-11') || cpuName.includes('i7-10') || cpuName.includes('i9-10')) {
        return 'LGA 1200';
    }
    return null;
}

function getMotherboardChipset(mbName) {
    if (!mbName || mbName === 'None Selected') return null;

    const chipsets = ['Z790', 'Z690', 'B660', 'Z590', 'B550', 'X570', 'B450', 'B650', 'X670'];
    for (const chip of chipsets) {
        if (mbName.includes(chip)) return chip;
    }
    return null;
}

function getSocketFromChipset(chipset) {
    const chipsetToSocket = {
        'Z790': 'LGA 1700',
        'Z690': 'LGA 1700',
        'B660': 'LGA 1700',
        'H670': 'LGA 1700',
        'Z590': 'LGA 1200',
        'Z490': 'LGA 1200',
        'B560': 'LGA 1200',
        'B550': 'AM4',
        'X570': 'AM4',
        'B450': 'AM4',
        'X470': 'AM4',
        'B650': 'AM5',
        'X670': 'AM5',
    };
    return chipsetToSocket[chipset] || null;
}

function getMotherboardRamType(mbName) {
    if (!mbName || mbName === 'None Selected') return null;

    const ddr5Boards = ['Z790', 'Z690 AORUS', 'B650', 'X670'];
    for (const board of ddr5Boards) {
        if (mbName.includes(board)) return 'DDR5';
    }
    return 'DDR4';
}

function getPsuWattage(psuName) {
    if (!psuName || psuName === 'None Selected') return 0;

    const match = psuName.match(/(\d+)\s*W/i);
    return match ? parseInt(match[1]) : 0;
}

function checkCompatibility() {
    const selectedCpu = localStorage.getItem('selectedProcessor') || null;
    const selectedGpu = localStorage.getItem('selectedGPU') || null;
    const selectedMb = localStorage.getItem('selectedMotherboard') || null;
    const selectedRam = localStorage.getItem('selectedRAM') || null;
    const selectedPsu = localStorage.getItem('selectedPSU') || null;
    const selectedCooling = localStorage.getItem('selectedCooling') || null;
    const selectedStorage = localStorage.getItem('selectedStorage') || null;

    const results = {
        errors: [],
        warnings: [],
        ok: [],
    };

    if (selectedCpu && selectedMb) {
        const cpuSocket = getCpuSocket(selectedCpu);
        const mbChipset = getMotherboardChipset(selectedMb);
        const mbSocket = getSocketFromChipset(mbChipset);

        if (cpuSocket && mbSocket) {
            if (cpuSocket !== mbSocket) {
                results.errors.push({
                    icon: '❌',
                    title: 'CPU + Motherboard: NOT Compatible!',
                    detail: `${selectedCpu} uses socket ${cpuSocket} but ${selectedMb} uses socket ${mbSocket}. They are not compatible.`,
                    fix: `Choose a motherboard with ${cpuSocket} socket, or a CPU with ${mbSocket} socket.`
                });
            } else {
                results.ok.push({
                    icon: '✅',
                    title: 'CPU + Motherboard: Compatible',
                    detail: `Both use ${cpuSocket} socket.`
                });
            }
        }
    }

    if (selectedRam && selectedMb) {
        const mbRamType = getMotherboardRamType(selectedMb);
        const ramIsDdr5 = selectedRam.toLowerCase().includes('ddr5');
        const ramType = ramIsDdr5 ? 'DDR5' : 'DDR4';

        if (mbRamType) {
            if (ramType !== mbRamType) {
                results.errors.push({
                    icon: '❌',
                    title: 'RAM + Motherboard: NOT Compatible!',
                    detail: `${selectedRam} is ${ramType} but ${selectedMb} supports ${mbRamType}. They won't fit.`,
                    fix: `Choose ${mbRamType} RAM, or change your motherboard.`
                });
            } else {
                results.ok.push({
                    icon: '✅',
                    title: 'RAM + Motherboard: Compatible',
                    detail: `Both support ${ramType}.`
                });
            }
        }
    }

    if (selectedGpu && selectedPsu) {
        const requiredWattage = COMPATIBILITY_RULES.gpuToPsu[selectedGpu] || 0;
        const psuWattage = getPsuWattage(selectedPsu);

        if (requiredWattage > 0 && psuWattage > 0) {
            if (psuWattage < requiredWattage) {
                results.errors.push({
                    icon: '❌',
                    title: 'GPU + PSU: Insufficient Power!',
                    detail: `${selectedGpu} requires at least ${requiredWattage}W PSU, but ${selectedPsu} is only ${psuWattage}W.`,
                    fix: `Upgrade to a ${requiredWattage}W or higher PSU.`
                });
            } else if (psuWattage < requiredWattage + 100) {
                results.warnings.push({
                    icon: '⚠️',
                    title: 'GPU + PSU: Tight Power Budget',
                    detail: `${selectedPsu} (${psuWattage}W) meets the minimum for ${selectedGpu} (${requiredWattage}W) but leaves little headroom. Consider upgrading.`,
                });
            } else {
                results.ok.push({
                    icon: '✅',
                    title: 'GPU + PSU: Compatible',
                    detail: `${psuWattage}W is sufficient for ${selectedGpu} (needs ${requiredWattage}W).`
                });
            }
        }
    }

    if (selectedCooling && selectedCpu) {
        const cpuSocket = getCpuSocket(selectedCpu);
        const coolerSockets = COMPATIBILITY_RULES.coolerSockets[selectedCooling];

        if (cpuSocket && coolerSockets) {
            if (!coolerSockets.includes(cpuSocket)) {
                results.errors.push({
                    icon: '❌',
                    title: 'Cooler + CPU: NOT Compatible!',
                    detail: `${selectedCooling} does not support ${cpuSocket} socket (${selectedCpu}).`,
                    fix: `Choose a cooler that supports ${cpuSocket} socket.`
                });
            } else {
                results.ok.push({
                    icon: '✅',
                    title: 'Cooler + CPU: Compatible',
                    detail: `${selectedCooling} supports ${cpuSocket} socket.`
                });
            }
        }
    }

    if (selectedStorage && selectedMb) {
        const isNvme = selectedStorage.toLowerCase().includes('nvme');
        if (isNvme) {
            results.ok.push({
                icon: '✅',
                title: 'Storage + Motherboard: Compatible',
                detail: `${selectedMb} has M.2 slots for NVMe SSDs.`
            });
        }
    }

    return results;
}

function showCompatibilityReport() {
    const results = checkCompatibility();
    const totalChecks = results.errors.length + results.warnings.length + results.ok.length;

    if (totalChecks === 0) {
        showNotification('Select at least 2 components to check compatibility', 'info');
        return;
    }

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'compatibility-modal';

    let reportHTML = '';

    if (results.errors.length > 0) {
        reportHTML += '<div class="compat-section compat-errors">';
        reportHTML += '<h3>❌ Compatibility Issues</h3>';
        results.errors.forEach(e => {
            reportHTML += `
                <div class="compat-item compat-error">
                    <div class="compat-item-header">${e.icon} ${e.title}</div>
                    <p>${e.detail}</p>
                    ${e.fix ? `<p class="compat-fix">💡 Fix: ${e.fix}</p>` : ''}
                </div>`;
        });
        reportHTML += '</div>';
    }

    if (results.warnings.length > 0) {
        reportHTML += '<div class="compat-section compat-warnings">';
        reportHTML += '<h3>⚠️ Warnings</h3>';
        results.warnings.forEach(w => {
            reportHTML += `
                <div class="compat-item compat-warning">
                    <div class="compat-item-header">${w.icon} ${w.title}</div>
                    <p>${w.detail}</p>
                </div>`;
        });
        reportHTML += '</div>';
    }

    if (results.ok.length > 0) {
        reportHTML += '<div class="compat-section compat-ok">';
        reportHTML += '<h3>✅ Compatible</h3>';
        results.ok.forEach(o => {
            reportHTML += `
                <div class="compat-item compat-pass">
                    <div class="compat-item-header">${o.icon} ${o.title}</div>
                    <p>${o.detail}</p>
                </div>`;
        });
        reportHTML += '</div>';
    }

    let statusBadge = '';
    if (results.errors.length > 0) {
        statusBadge = '<div class="compat-status compat-status-fail">❌ Issues Found — Some components are NOT compatible</div>';
    } else if (results.warnings.length > 0) {
        statusBadge = '<div class="compat-status compat-status-warn">⚠️ Compatible with Warnings</div>';
    } else {
        statusBadge = '<div class="compat-status compat-status-pass">✅ All Components are Compatible!</div>';
    }

    overlay.innerHTML = `
        <div class="orders-modal-content" style="max-width:700px;">
            <h2>🔧 Compatibility Report</h2>
            ${statusBadge}
            ${reportHTML}
            <button onclick="document.getElementById('compatibility-modal').remove()" class="btn-close-modal">Close</button>
        </div>
    `;

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
    });

    document.body.appendChild(overlay);
}

window.checkCompatibility = checkCompatibility;
window.showCompatibilityReport = showCompatibilityReport;

console.log('🔧 Compatibility System loaded');
