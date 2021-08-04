class VaMessages extends HTMLElement 
{
    constructor() 
    {
        super();
        
        this.dom = this.attachShadow({mode: 'open'});
        this.dom.innerHTML = `
    
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">
            <link rel="stylesheet" href="https://voxxlr.github.io/app/ui.css">

            <style>
            
                :host
                {
                }
            
                .message
                { 
                    position: relative;
                    padding: 0.5em;
                    border: solid 1px var(--border);
                    margin-bottom: 0.5em;
                    border-radius: 0.7em;
                }
                
                .date { font-size: 0.8em }
                .text { margin-top: 0.5em }
                
                button
                {
                    position: absolute;
                    right: 0.5em;
                    top: 0.5em;
                }
                
                i:before { font-family: "Font Awesome 5 Free" !important; }
                
                i[alert] { color: #cc3300 }
                i[alert]:before { content: "\\f0f3";}
                
                i[warn] { color: #ffcc00 }
                i[warn]:before { content: "\\f071"; }
            
                i[info] { color: #99cc33; }
                i[info]:before { content: "\\f05a"; }
                
                span { margin-left: 0.5em; }

            </style>
            
            <template>
                <div class="message">
                    <i class="fas"></i>
                    <span class="date"></span>
                    <p class="text"></p>
                    <button class="vx-round vx-secondary"><i class="fas fa-trash"></i></button>
                </div>
            </template>
            
            <main>
            </main>
    
        `;
        
        this.main = this.dom.querySelector("main");
        this.main.addEventListener("click", (event) =>
        {
            let entry = event.target.closest("button");
            if (entry)
            {
                entry = entry.closest("div");
                fetch(`https://www.voxxlr.com/account/message`, 
                { 
                    method: 'DELETE', 
                    headers: new Headers({
                     'Authorization': `Bearer ${this.getAttribute("token")}`, 
                     'Content-Type': "application/json",
                     'Content-Encoding': 'gzip'
                    }),
                    body: JSON.stringify({ index: Array.prototype.indexOf.call(this.main.children, entry) })
                }); 
                entry.remove();
            }
        });

    }
    
    connectedCallback() 
    {
        let template = this.dom.querySelector("template");
        
        if (this.hasAttribute("list"))
        {
            let messages = JSON.parse(this.getAttribute("list"));
            messages.reverse().forEach(message =>
            {
                let entry = template.content.cloneNode(true);
                entry.querySelector("i").toggleAttribute(message.level, true);
                entry.querySelector(".text").textContent = message.text;
                entry.querySelector(".date").textContent = message.date;
                this.main.appendChild(entry);	
            });
        }
    }
}

customElements.define("va-messages", VaMessages);


class VaUsers extends HTMLElement 
{
    static get observedAttributes() 
    {
        return ['list', 'account'];
    }

    constructor() 
    {
        super();
        
        this.dom = this.attachShadow({mode: 'open'});
        this.dom.innerHTML = `
    
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" >
            <link rel="stylesheet" href="https://voxxlr.github.io/app/ui.css">

            <style>
            
                :host
                {
                }
        
                ul 
                { 
                    list-style: none;
                    margin-bottom: 2em; 
                }
                
                input { margin-left: 1em; }
                button { margin-right: 0.5em; }
                li { margin-bottom: 0.5em; }

            </style>
            
            <template>
            
                <li>
                    <button class="vx-round vx-secondary"><i class="fas fa-trash"></i></button>
                    <span></span>
                </li>

            </template>

            <div>
                Add/Remove email addresses of individuals allowed to sign into your account. Users listed here can join 
                this account by entering the email address <strong></strong> under <em>"Join Account..."</em> on the login screen.
            </div>
            
            <ul>
            </ul>
            
            <div>
                <i class="fas fa-user"></i><input id="input-email" placeholder="Email address..." type="email" autocomplete="nope"/>
            </div>

        `;		
        
        this.ul = this.dom.querySelector("ul");
        this.ul.addEventListener("click", (event) =>
        {
            let entry = event.target.closest("button");
            if (entry)
            {
                entry = entry.closest("li");
                fetch(`https://www.voxxlr.com/account/member`, 
                { 
                    method: 'DELETE', 
                    headers: new Headers({
                     'Authorization': `Bearer ${this.getAttribute("token")}`, 
                     'Content-Type': "application/json",
                     'Content-Encoding': 'gzip'
                    }),
                    body: JSON.stringify({ email: entry.querySelector("span").textContent })
                }); 
                entry.remove();
            }
        });
        
        let input = this.dom.querySelector("input");
        input.addEventListener('change', (event)=> 
        {
            if (event.currentTarget.value.length>0)
            {
                this.addUser(event.currentTarget.value);
                
                fetch('https://www.voxxlr.com/account/member', 
                { 
                    method: 'PUT', 
                    headers: new Headers({
                     'Authorization': `Bearer ${this.getAttribute("token")}`, 
                     'Content-Type': "application/json",
                     'Content-Encoding': 'gzip'
                    }),
                    body: JSON.stringify({ email: event.currentTarget.value })
                }); 
        
                event.currentTarget.value = "";
            }
        });
        
        input.addEventListener('keyup',(event)=>
        {
            if(event.keyCode == 13)
            {
                if (event.currentTarget.value.length>0)
                {
                    this.addUser(event.currentTarget.value);
                        
                    fetch('https://www.voxxlr.com/account/member', 
                    { 
                        method: 'PUT', 
                        headers: new Headers({
                         'Authorization': `Bearer ${this.getAttribute("token")}`, 
                         'Content-Type': "application/json",
                         'Content-Encoding': 'gzip'
                        }),
                        body: JSON.stringify({ email: event.currentTarget.value })
                    }); 
                    
                    event.currentTarget.value = "";
                }
            }
        });
    }
    
    addUser(email)
    {
        let template = this.dom.querySelector("template");
        let entry = template.content.cloneNode(true);
        entry.querySelector("span").textContent = email;
        this.ul.appendChild(entry);	
    }

    attributeChangedCallback(name, oldValue, newValue)
    {
        if (name == "list")
        {
            let list = JSON.parse(newValue);
            list.forEach(email =>
            {
                this.addUser(email);
            });
        }
    }

    
    connectedCallback() 
    {
        let list = JSON.parse(this.getAttribute("members"));
        if (list)
        {
            list.forEach(email =>
            {
                this.addUser(email);
            });
        }
        
        let span = this.dom.querySelector("strong");
        span.textContent = this.getAttribute("account");
    }
}

customElements.define("va-users", VaUsers);




class VaCard extends HTMLElement 
{
    static get observedAttributes() 
    {
        return ['card'];
    }
    
    constructor() 
    {
        super();
        
        this.dom = this.attachShadow({mode: 'open'});
        this.dom.innerHTML = `
    
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" >
            <link rel="stylesheet" href="https://voxxlr.github.io/app/ui.css">

            <style>
            
                :host
                {
                    display: flex;
                    flex-direction: column;
                }
            
                :host > div
                {
                    display: flex;
                    flex-direction: column;
                    justify-content: stretch;
                }
                
                label > span
                {
                    margin-left: 3em;
                }

                #errors 
                {
                    margin-top: 0.5em; 
                    margin-bottom: 0.5em; 
                }
                
                ui-panel
                {
                    display: flex;
                    flex-direction: column;
                    width: 40em;
                }
                
                ui-panel:nth-of-type(2) { margin-top: 1em; }
                ui-modal button {
                    float: right;
                    margin-top: 1em;
                }

                input { margin-bottom: 0.5em; }
                
                ::slotted(*) { margin-top: 1em; }
                
                button { margin-top: 1em }
        
            </style>
            
            <div>
                <label>Name:<span id="name"></span></label>
                <label>Email:<span id="email"></span></label>
                <label>Phone:<span id="phone"></span></label>
                <div class="vx-margin-top1">
                    <span id="brand"></span>: ****<span id="last4"></span>
                    <span id="exp_month"></span>/<span id="exp_year"></span>
                </div>
            </div>
            
            <button class="vx-secondary" >Change</button>
            
            <ui-modal id="method" hidden close>
                <ui-panel name="Billing Information">
                    <input type="text" placeholder="Name" autocomplete="name">
                    <input type="email" placeholder="Email" autocomplete="email">
                    <input type="tel" placeholder="Phone" autocomplete="tel">
                </ui-panel>
                <ui-panel name="Credit Card" required>
                    <slot></slot>
                    <div id="errors"></div>
                </ui-panel>
                
                <button class="vx-secondary" >Save</button>
            </ui-modal>	
        `;		
        
        this.errors = this.dom.getElementById("errors");
        
        this.submit = this.dom.querySelector("ui-modal button");
        this.submit.addEventListener("click", event =>
        {
            let details = {};
            
            let value = this.dom.querySelector("ui-modal input:nth-of-type(1)").value;
            if (value)
            {
                details.name = value;
            }
            
            value = this.dom.querySelector("ui-modal input:nth-of-type(2)").value;
            if (value)
            {
                details.email = value;
            }

            value = this.dom.querySelector("ui-modal input:nth-of-type(3)").value;
            if (value)
            {
                details.phone = value;
            }
            
            this.submit.disabled = true;
            this.stripe.createPaymentMethod({ type: 'card', card: this.card, billing_details: details })
            .then((result) => 
            {
                if (!result.error) 
                {
                    fetch('https://www.voxxlr.com/payment/card', 
                    { 
                        method: 'POST', 
                        headers: new Headers({
                            'Authorization': `Bearer ${this.getAttribute("token")}`,
                            'Accept': 'application/json',
                        }),
                        body: JSON.stringify({ card: result.paymentMethod.id, })
                    }).then(async (response) => 
                    {
                        if (response.ok)
                        {
                            let card = await response.json();
                
                            for (var p in card)
                            {
                                this.dom.getElementById(`${p}`).textContent = card[p];
                            }
                            this.setAttribute("card", JSON.stringify("card"));
                            
                            this.dom.querySelector("ui-modal").hidden = true;
                            this.dispatchEvent(new CustomEvent('card-changed', { }));
                        }
                        else
                        {
                            this.errors.textContent = "Payment failure : " + response.status;
                        }
                        this.submit.disabled = false;
                    });

                    this.parentElement.hidden = true;
                } 
                else 
                {
                    this.errors.textContent = result.error.message;
                    this.submit.disabled = false;
                }
            });
        });
        
        this.dom.querySelector(":host > button").addEventListener("click", event=>
        {
            this.open();
        });
    }
    
    connectedCallback() 
    {
        if (this.hasAttribute("card"))
        {
            let card = JSON.parse(this.getAttribute("card"));
            
            for (var p in card)
            {
                this.dom.getElementById(`${p}`).textContent = card[p];
            }
        }
    }

    
    open()
    {
        this.dom.querySelector("ui-modal input:nth-of-type(1)").value = this.dom.getElementById("name").textContent;
        this.dom.querySelector("ui-modal input:nth-of-type(2)").value = this.dom.getElementById("email").textContent;
        this.dom.querySelector("ui-modal input:nth-of-type(3)").value = this.dom.getElementById("phone").textContent;
        
        if (!this.stripe)
        {
            this.stripe = Stripe(this.getAttribute('key'));
            
            let elements = this.stripe.elements();
            
            this.card = elements.create('card', 
            {
                style: 
                {
                    base: 
                    {
                        iconColor: '#FF7500',
                        fontWeight: 500,
                        fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
                        fontSize: '16px',
                        fontSmoothing: 'antialiased',
                        '::placeholder': { color: '#87BBFD' },
                    },
    
                    invalid: 
                    {
                        iconColor: 'FF7500',
                        color:  '#f00',
                    }
                }
            });
            
            this.card.mount('#payment-card');
            
            this.card.on('change', event =>
            {
                if (event.error) 
                {
                    this.errors.textContent = event.error.message;
                } 
                else 
                {
                    this.errors.textContent = '';
                    this.submit.disabled = !event.complete;
                }
            });			
        }
        
        this.dom.querySelector("ui-modal").hidden = false;
    }
}

customElements.define("va-card", VaCard);










(function() {
    
const template = document.createElement('template');

template.innerHTML = `

   <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" >
    <link rel="stylesheet" href="https://voxxlr.github.io/app/ui.css">

    <style>
    
        :host
        {
          --info-color: #d4edda;
          --warn-color: #fff3cd;
          --alert-color: #f8d7da;
          --info-back: #f8d7da;
          --warn-back: #f8d7da;
          --alert-back: #f8d7da;
        }
        
    
        .bar
        {
            position: relative;
            background-color: var(--selected);
            height: 2.0em;
            position: relative;
            border-radius: 0.7em;
            line-height: 1em;
            font-weight: 400;
            z-index: -1;
        }
    
        .bar div
        {
            z-index: -1;
            height: 100%;
            overflow: visible;
            text-align: center;					
            border-radius: 0.7em;
            float: right;
        }
        
        slot[name=left]::slotted(*)
        {
            position: absolute;
            left: 3%;
            z-index: 99;
            top: 0.5em;
        }
        
        slot[name=right]::slotted(*)
        {
            position: absolute;
            right: 3%;
            z-index: 99;
            top: 0.5em;
        }
        

    </style>

    <div class='bar'>			
        <slot name="left"></slot>
        <slot name="right"></slot>
        <div>
        </div>
    </div>	
        
    `;

class VaBar extends HTMLElement 
{
    static get observedAttributes() 
    {
        return ['level'];
    }
    
    constructor() 
    {
        super();
        
        this.dom = this.attachShadow({mode: 'open'});
        this.dom.appendChild(template.content.cloneNode(true));
    }
    
    attributeChangedCallback(name, oldValue, newValue)
    {
        if (name == "level")
        {
            let used = Math.min(this.getAttribute("level")*100, 100);
            let level = 'info';
            /*
            if (used < 70)
            {
                level = 'info';
            }
            else if (used < 90)
            {
                level = 'warn';
            }
            else
            {
                level = 'alert';
            }
            */
            let div = this.dom.querySelector(".bar > div");
            div.style.width = `${Math.min(100,100-used)}%`;
            div.style.backgroundColor = `var(--${level}-color)`;
            
            this.dom.querySelector(".bar").style.backgroundColor =  `var(--${level}-back)`;
        }
    }
}

customElements.define("va-bar", VaBar);

})();



class VaUtilization extends HTMLElement 
{
    static get observedAttributes() 
    {
        return ['meter'];
    }
    
    constructor() 
    {
        super();
        
        this.dom = this.attachShadow({mode: 'open'});
        this.dom.innerHTML = `
    
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" >
            <link rel="stylesheet" href="https://voxxlr.github.io/app/ui.css">

            <style>
            
                :host
                {
                }
                    
                va-bar:not(:first-child) { margin-top: 1em; }
                va-bar 
                { 
                    display: block; 
                }

            </style>
            
            <va-bar><span slot="left">Storage</span><span slot="right"></span></va-bar> 			
            <va-bar><span slot="left">Bandwidth</span><span slot="right"></span></va-bar> 				

        `;		
    }
    
    attributeChangedCallback(name, oldValue, newValue)
    {
        let GB = 1024*1024*1024;
        
        let meter = JSON.parse(newValue);
        
        let percent = meter.storage_used/meter.storage_max;
        let bar = this.dom.querySelector("va-bar:nth-of-type(1)");
        bar.setAttribute("level", percent);
        let span = bar.querySelector("span[slot='right']");
        //span.textContent = `${Math.ceil(100*percent)}% used`;
        span.textContent = `${(meter.storage_used/GB).toFixed(2)}/${meter.storage_max/GB} GB`;

        percent = meter.bandwidth_used/meter.bandwidth_max;
        bar = this.dom.querySelector("va-bar:nth-of-type(2)");
        bar.setAttribute("level", percent);
        span = bar.querySelector("span[slot='right']");
        //span.textContent = `${Math.ceil(100*percent)}% used`;
        span.textContent = `${(meter.bandwidth_used/GB).toFixed(2)}/${meter.bandwidth_max/GB} GB`;
    }
}

customElements.define("va-utilization", VaUtilization);
