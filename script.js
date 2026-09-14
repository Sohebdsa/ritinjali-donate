
// Config
const WIX_BASE_URL = 'https://www.ritinjali.org';

const RAZORPAY_CONFIG = {
    keyId: 'rzp_live_TbnBUVllLD3B5v', // Ritinjali Live Key ID
    orgName: 'Ritinjali',
    logoUrl: 'https://static.wixstatic.com/media/6d82ba_1ad64fe642dd4ef0bfd45e991823ed28~mv2.jpg/v1/fill/w_66,h_102,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/1706865449124_edited.jpg',
    themeColor: '#177A47',
    currency: 'INR',
};

async function callWixFunction(actionName, payload) {
    const prefixes = ['/_functions/', '/_functions-dev/'];

    let lastError = null;
    for (const prefix of prefixes) {
        const url = WIX_BASE_URL + prefix + actionName;
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (res.status === 404) {
                continue;
            }

            const data = await res.json().catch(function () { return {}; });
            if (!res.ok) {
                throw new Error(data && data.error ? data.error : ('Server error: ' + res.status));
            }
            return data;
        } catch (err) {
            lastError = err;
        }
    }
    throw lastError || new Error('Unable to connect to payment backend.');
}

const contributionData = {
    "1000": "Supports the cost of stationery for 10 students at our learning centres for one month",
    "2500": "Supports nutritious lunches for one child or youth for one month",
    "5000": "Supports foundational learning for one child",
    "8000": "Supports a high school dropout complete Grade 10 or 12",
    "other": "Supports education, livelihoods, and community development programmes"
};

const amountStep = document.getElementById("amountStep");
const detailsStep = document.getElementById("detailsStep");
const successStep = document.getElementById("successStep");
const failedStep = document.getElementById("failedStep");

const backBtn = document.getElementById("backBtn");
const anotherBtn = document.getElementById("anotherBtn");

const indianDonorForm = document.getElementById("indianDonorForm");
const foreignDonorForm = document.getElementById("foreignDonorForm");
const detailsTitle = document.getElementById("detailsTitle");

function showStep(step) {
    amountStep.classList.remove("active");
    detailsStep.classList.remove("active");
    successStep.classList.remove("active");
    if (failedStep) failedStep.classList.remove("active");
    step.classList.add("active");

    const card = document.querySelector(".donation-card");
    if (card) {
        card.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
}

function renderSuccessScreen(info) {
    const amtEl = document.getElementById("successAmount");
    if (amtEl) amtEl.textContent = "₹" + Number(info.amount || 0).toLocaleString("en-IN");

    const payIdEl = document.getElementById("successPaymentId");
    if (payIdEl) payIdEl.textContent = info.paymentId || "—";

    const orderIdEl = document.getElementById("successOrderId");
    if (orderIdEl) orderIdEl.textContent = info.orderId || "—";

    const nameEl = document.getElementById("successDonorName");
    if (nameEl) nameEl.textContent = info.donorName || "Valued Supporter";

    const emailEl = document.getElementById("successDonorEmail");
    if (emailEl) emailEl.textContent = info.email || "your email";

    const dateEl = document.getElementById("successDate");
    if (dateEl) {
        dateEl.textContent = new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    // WhatsApp Share
    const whatsappBtn = document.getElementById("shareWhatsappBtn");
    if (whatsappBtn) {
        const text = encodeURIComponent(
            `I just supported ${RAZORPAY_CONFIG.orgName}! Join me in creating an impact: ${window.location.href}`
        );
        whatsappBtn.onclick = function () {
            window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
        };
    }

    // Print Receipt
    const printBtn = document.getElementById("printReceiptBtn");
    if (printBtn) {
        printBtn.onclick = function () {
            window.print();
        };
    }
}

let pendingRetryFn = null;

function renderFailedScreen(reason, retryFn) {
    const reasonEl = document.getElementById("failedReasonText");
    if (reasonEl) reasonEl.textContent = reason || "Payment transaction could not be authorized.";
    pendingRetryFn = retryFn || null;
}

const retryPaymentBtn = document.getElementById("retryPaymentBtn");
if (retryPaymentBtn) {
    retryPaymentBtn.addEventListener("click", function () {
        if (typeof pendingRetryFn === "function") {
            pendingRetryFn();
        } else {
            showStep(detailsStep);
        }
    });
}

const changeDetailsBtn = document.getElementById("changeDetailsBtn");
if (changeDetailsBtn) {
    changeDetailsBtn.addEventListener("click", function () {
        showStep(amountStep);
    });
}

// ─── Frequency Toggle (ONE TIME vs MONTHLY) ───
const typeOnetime = document.getElementById("type-onetime-1");
const typeMonthly = document.getElementById("type-monthly-1");
const onetimeSlabs = document.querySelectorAll(".onetime-slab");
const monthlySlabs = document.querySelectorAll(".monthly-slab");
const amountMetaText = document.getElementById("amountMetaText");
const otherInputWrap = document.getElementById("otherInputWrap");
const otherImpactDesc = document.getElementById("otherImpactDesc");
const otherAmountInput = document.getElementById("input-other-amount");

function updateFrequency(type) {
    if (type === "monthly") {
        onetimeSlabs.forEach(el => el.style.display = "none");
        monthlySlabs.forEach(el => el.style.display = "block");

        const defaultMonthly = document.getElementById("amount-2500-m");
        if (defaultMonthly) {
            defaultMonthly.checked = true;
            if (amountMetaText) {
                amountMetaText.style.display = "block";
                amountMetaText.textContent = defaultMonthly.dataset.title || contributionData["2500"];
            }
        }
        if (otherInputWrap) otherInputWrap.style.display = "none";
    } else {
        monthlySlabs.forEach(el => el.style.display = "none");
        onetimeSlabs.forEach(el => el.style.display = "block");

        const defaultOnetime = document.getElementById("amount-2500-1");
        if (defaultOnetime) {
            defaultOnetime.checked = true;
            if (amountMetaText) {
                amountMetaText.style.display = "block";
                amountMetaText.textContent = defaultOnetime.dataset.title || contributionData["2500"];
            }
        }
        if (otherInputWrap) otherInputWrap.style.display = "none";
    }
}

if (typeOnetime) {
    typeOnetime.addEventListener("change", function () {
        if (this.checked) updateFrequency("onetime");
    });
}

if (typeMonthly) {
    typeMonthly.addEventListener("change", function () {
        if (this.checked) updateFrequency("monthly");
    });
}

// ─── Amount Slabs Selection ───
const amountRadios = document.querySelectorAll('input[name="amount"]');
amountRadios.forEach(radio => {
    radio.addEventListener("change", function () {
        if (this.checked) {
            const message = contributionData[this.value] || this.dataset.title || "";
            if (this.value === "other") {
                if (amountMetaText) amountMetaText.style.display = "none";
                if (otherInputWrap) otherInputWrap.style.display = "flex";
                if (otherImpactDesc) otherImpactDesc.textContent = message || contributionData["other"];
                if (otherAmountInput) otherAmountInput.focus();
            } else {
                if (otherInputWrap) otherInputWrap.style.display = "none";
                if (amountMetaText) {
                    amountMetaText.style.display = "block";
                    amountMetaText.textContent = message;
                }
            }
        }
    });
});

if (otherAmountInput) {
    otherAmountInput.addEventListener("input", function () {
        if (this.value && Number(this.value) > 0 && otherImpactDesc) {
            otherImpactDesc.textContent = "Supports education, livelihoods, and community development programmes";
        }
    });
}

// ─── Citizen Selection ───
const citizenRadios = document.querySelectorAll('input[name="citizen"]');
const contentForeignCitizen = document.getElementById("contentForeignCitizen");

citizenRadios.forEach(radio => {
    radio.addEventListener("change", function () {
        if (this.value === "foreign") {
            if (contentForeignCitizen) contentForeignCitizen.style.display = "block";
        } else {
            if (contentForeignCitizen) contentForeignCitizen.style.display = "none";
        }
    });
});

let currentAmount = 0;

// ─── Donate Button (Advance to Details Step) ───
const donateBtn = document.getElementById("donateButton");
if (donateBtn) {
    donateBtn.addEventListener("click", function () {
        const checkedAmountRadio = document.querySelector('input[name="amount"]:checked');

        if (!checkedAmountRadio) {
            alert("Please select a contribution amount.");
            return;
        }

        let amount = checkedAmountRadio.value;

        if (amount === "other") {
            amount = otherAmountInput ? otherAmountInput.value.trim() : "";
            if (!amount || Number(amount) <= 0) {
                alert("Please enter a valid contribution amount.");
                if (otherAmountInput) otherAmountInput.focus();
                return;
            }
        }

        const coverChecked = document.getElementById("coverCharges") ? document.getElementById("coverCharges").checked : false;
        const baseAmount = Number(amount);
        // Add 3% gateway fee if donor opts in
        currentAmount = coverChecked
            ? Math.round(baseAmount * 1.03)
            : baseAmount;

        const citizenEl = document.querySelector('input[name="citizen"]:checked');
        const citizen = citizenEl ? citizenEl.value : "indian";

        if (citizen === "indian") {
            indianDonorForm.classList.remove("hidden");
            foreignDonorForm.classList.add("hidden");
            detailsTitle.textContent = "Fill Details Below";
        } else {
            foreignDonorForm.classList.remove("hidden");
            indianDonorForm.classList.add("hidden");
            detailsTitle.textContent = "Foreign Citizen Details";
        }

        showStep(detailsStep);
    });
}

backBtn.addEventListener("click", function () {
    showStep(amountStep);
});

const indianError = document.getElementById("indianError");
const indianPaymentBtn = document.getElementById("indianPaymentBtn");

indianDonorForm.addEventListener("submit", function (e) {
    e.preventDefault();
    indianError.classList.add("hidden");
    indianError.textContent = "";

    const pan = document.getElementById("pan").value.trim().toUpperCase();
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan)) {
        indianError.textContent = "Please enter a valid 10-digit Indian PAN (e.g. ABCDE1234F).";
        indianError.classList.remove("hidden");
        document.getElementById("pan").focus();
        return;
    }

    indianPaymentBtn.disabled = true;
    indianPaymentBtn.textContent = "PROCESSING...";

    const donorInfo = {
        name: document.getElementById("fullName").value.trim(),
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        pan: pan,
        address: document.getElementById("address").value.trim(),
        city: document.getElementById("city").value.trim(),
        state: document.getElementById("state").value.trim(),
        country: document.getElementById("country").value,
        anonymous: document.getElementById("anonymous").checked,
        coverCharges: document.getElementById("coverCharges").checked,
        citizenType: "indian",
    };

    openRazorpay(currentAmount, donorInfo, indianPaymentBtn, indianError);
});

const foreignError = document.getElementById("foreignError");
const foreignPaymentBtn = document.getElementById("foreignPaymentBtn");

foreignDonorForm.addEventListener("submit", function (e) {
    e.preventDefault();
    foreignError.classList.add("hidden");
    foreignError.textContent = "";

    foreignPaymentBtn.disabled = true;
    foreignPaymentBtn.textContent = "PROCESSING...";

    const donorInfo = {
        name: document.getElementById("foreignName").value.trim(),
        email: document.getElementById("foreignEmail").value.trim(),
        phone: document.getElementById("foreignMobile").value.trim(),
        taxId: document.getElementById("foreignTaxId").value.trim(),
        address: document.getElementById("foreignAddress").value.trim(),
        purpose: document.getElementById("foreignPurpose").value,
        citizenType: "foreign",
    };

    openRazorpay(currentAmount, donorInfo, foreignPaymentBtn, foreignError);
});

anotherBtn.addEventListener("click", function () {
    indianDonorForm.reset();
    foreignDonorForm.reset();
    if (indianError) indianError.classList.add("hidden");
    if (foreignError) foreignError.classList.add("hidden");

    // Reset to ONE TIME default
    if (typeOnetime) {
        typeOnetime.checked = true;
        updateFrequency("onetime");
    }
    if (otherAmountInput) otherAmountInput.value = "";
    const indianRadio = document.getElementById("citizen1-1");
    if (indianRadio) indianRadio.checked = true;
    if (contentForeignCitizen) contentForeignCitizen.style.display = "none";

    showStep(amountStep);
});

function openRazorpay(amountINR, donorInfo, submitBtn, errorEl) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'OPENING GATEWAY...';

    function launchCheckout(orderId) {
        if (!orderId) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'PROCEED TO PAYMENT';
            errorEl.textContent = 'Cannot launch checkout: Missing server Order ID.';
            errorEl.classList.remove('hidden');
            return;
        }

        const options = {
            key: RAZORPAY_CONFIG.keyId,
            amount: amountINR * 100,          // Razorpay works in paise
            currency: RAZORPAY_CONFIG.currency,
            name: RAZORPAY_CONFIG.orgName,
            image: RAZORPAY_CONFIG.logoUrl,
            order_id: orderId,                  // Server-created Razorpay Order ID
            description: 'Donation to ' + RAZORPAY_CONFIG.orgName,
            prefill: {
                name: donorInfo.name || '',
                email: donorInfo.email || '',
                contact: donorInfo.phone || '',
            },
            notes: {
                pan: donorInfo.pan || '',
                citizen_type: donorInfo.citizenType || 'indian',
                anonymous: donorInfo.anonymous || false,
                address: donorInfo.address || '',
            },
            config: {
                display: {
                    // Explicitly allow all payment methods incl. UPI / QR
                    blocks: {
                        banks: { name: 'Pay via UPI / QR', instruments: [{ method: 'upi' }] },
                    },
                    sequence: ['block.banks'],
                    preferences: { show_default_blocks: true },
                }
            },
            theme: { color: RAZORPAY_CONFIG.themeColor },
            handler: function (response) {
                submitBtn.textContent = 'VERIFYING...';

                callWixFunction('verifyPayment', {
                    orderId: response.razorpay_order_id,
                    paymentId: response.razorpay_payment_id,
                    signature: response.razorpay_signature,
                })
                    .then(function (data) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'PROCEED TO PAYMENT';
                        if (data && data.valid) {
                            renderSuccessScreen({
                                amount: amountINR,
                                paymentId: response.razorpay_payment_id,
                                orderId: response.razorpay_order_id,
                                donorName: donorInfo.name,
                                email: donorInfo.email,
                            });
                            showStep(successStep);
                        } else {
                            renderFailedScreen(
                                'Payment signature verification failed. If your account was debited, your bank will automatically refund it within 3-5 working days.',
                                function () { showStep(detailsStep); }
                            );
                            showStep(failedStep);
                        }
                    })
                    .catch(function (err) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'PROCEED TO PAYMENT';
                        renderFailedScreen(
                            'Verification error: ' + (err.message || 'Please contact support with Payment ID ' + (response.razorpay_payment_id || '')),
                            function () { showStep(detailsStep); }
                        );
                        showStep(failedStep);
                    });
            },
            modal: {
                ondismiss: function () {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'PROCEED TO PAYMENT';
                    renderFailedScreen(
                        'Payment window was closed before completion. No amount was charged.',
                        function () { openRazorpay(amountINR, donorInfo, submitBtn, errorEl); }
                    );
                    showStep(failedStep);
                }
            }
        };

        // Open Razorpay inline modal (native overlay — required for QR/UPI in live mode)
        runInlineRazorpay(options);
    }

    function runInlineRazorpay(options) {
        const rzp = new Razorpay(options);
        rzp.on('payment.failed', function (response) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'PROCEED TO PAYMENT';
            const reason = (response.error && response.error.description)
                ? response.error.description
                : 'Payment was declined by bank or failed.';
            renderFailedScreen(
                reason,
                function () { openRazorpay(amountINR, donorInfo, submitBtn, errorEl); }
            );
            showStep(failedStep);
        });
        rzp.open();
    }

    // Server-side order creation via resilient Wix backend HTTP function
    callWixFunction('createOrder', {
        amount: amountINR,
        currency: RAZORPAY_CONFIG.currency,
        donor: donorInfo,
    })
        .then(function (data) {
            if (!data || !data.id) {
                throw new Error('No order ID returned by backend.');
            }
            launchCheckout(data.id);
        })
        .catch(function (err) {
            console.error('[createOrder Error]', err);
            submitBtn.disabled = false;
            submitBtn.textContent = 'PROCEED TO PAYMENT';
            renderFailedScreen(
                'Could not initiate order: ' + (err.message || 'Please check your connection and try again.'),
                function () { openRazorpay(amountINR, donorInfo, submitBtn, errorEl); }
            );
            showStep(failedStep);
        });
}