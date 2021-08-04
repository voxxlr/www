class VaMenu extends HTMLElement 
{
    constructor() 
    {
        super();
        
        this.dom = this.attachShadow({mode: 'open'});
        this.dom.innerHTML = `
    
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" >
 
            <style>
            
                :host 
                {
                    --management-app: #0075FF;
                    --presentation-app: #ffcc00;
                    --productivity-app: #00cc33;
                    --labs-app: #cc3300;
                    
                    --background: #F8F8FE;
                }
                
                :host > i { color: var(--primary); padding: 0.5em;  }
                :host > div
                {
                    position: fixed;
                    left: 0;
                    top: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 99999;
                }
                
                :host([left]) aside { right: 0.5em; top: 2.5em; }
                :host([right]) aside { left: 0.5em; top: 2.5em; }
                
                aside
                {
                    position: absolute;
                    background-color: white;
                    border: 1px solid var(--border)
                }
                aside { width: 14em; }  
                aside i  
                {
                    float: left;
                    margin-right: 1em;
                    width: 1em;
                }
                
                .app  
                { 
                    display: flex; 
                    align-items: center;
                    padding-left: 1.5em; 
                    padding-right: 1.5em; 
                    border-bottom: 1px solid var(--border);
                }
    
                .app.management { color: var(--management-app) }
                .app.presentation { color: var(--presentation-app) }
                .app.productivity { color: var(--productivity-app) }
                .app.labs { color: var(--labs-app) }
                
                .app:hover { background-color: var(--hover); }
                
                hr { border-color: var(--border); border-style: solid; margin: 0.5em }
                
                .launchpad
                {
                    text-align:center;
                    background: var(--background);
                    padding: 1.5em; 
                    padding: 1.5em; 
                }
                .launchpad:hover { background-color: var(--hover); }
                    
            </style>

            <i class="fas fa-th"></i>
            <div hidden>
                <aside>
                    <div>
                    </div>	
                    <div class="launchpad">Back to Launchpad</div>
                </aside>
            </div>
            
        `;
    
        this.dom.querySelector(":host > i").addEventListener("click", event =>  
        {
            this.dom.querySelector(":host > div").hidden = false;	
        })
        this.dom.querySelector(":host > div").addEventListener("click", event=> 
        {
            this.dom.querySelector(":host > div").hidden = true;	
        });
        
        this.dom.querySelectorAll("aside div.launchpad").forEach(item => item.addEventListener("click", event=> 
        {
            this.dispatchEvent(new CustomEvent("load-launchpad", { }));
        }));
    }
    
    setManifest(manifest)
    {
        let parent = this.dom.querySelector("aside > div:nth-of-type(1)");
        while (parent.firstElementChild)
        {
            parent.firstElementChild.remove();
        }
        for (var id in manifest)
        {
            let app = manifest[id];
            
            let div = document.createElement("div");
            div.setAttribute("class", `app ${app.category}`)			
            div.setAttribute("href", `${id}`);

            let i= document.createElement("i")
            i.setAttribute("class", `fas ${app.icon}`)

            let p= document.createElement("p")
            p.textContent = app.title;

            div.appendChild(i);
            div.appendChild(p);

            parent.appendChild(div);
        }
        
        this.dom.querySelectorAll("aside div.app").forEach(item => item.addEventListener("click", event=> 
        {
            let div = event.currentTarget;
            
            this.dispatchEvent(new CustomEvent("load-app", { detail: { app:div.getAttribute("href") } }));
        }));
    }
}

customElements.define("va-menu", VaMenu);




class VaSettings extends HTMLElement 
{
    static get observedAttributes() 
    {
        return ['token'];
    }
    
    constructor() 
    {
        super();
        
        this.dom = this.attachShadow({mode: 'open'});
        this.dom.innerHTML = `
    
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" >

            <style>
            
                :host 
                {
                }
                
                :host > i { color: var(--primary); padding: 0.5em;  }
                :host > div
                {
                    position: fixed;
                    left: 0;
                    top: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 99999;
                }
                
                aside
                {
                    position: absolute;
                    background-color: white;
                    padding: 1em;
                    border: 1px solid var(--border)
                }
                aside > div  
                { 
                    padding: 0.5em; 
                    display: flex; 
                    align-items: center
                    border-bottom: 1px solid var(--border);
                }
                aside > div:hover { background-color: var(--hover); }
                
                :host([left]) aside { right: 0.5em; top: 2.5em; }
                :host([right]) aside { left: 0.5em; top: 2.5em; }

                aside { width: 12em; }  
                aside i  
                {
                    color: var(--primary);
                    float: left;
                    margin-right: 1em;
                    width: 1em;
                }
                
                hr { border-color: var(--border); border-style: solid; margin: 0.5em }
                
                :host(:not([token])) div[account], :host(:not([token])) div[account]  i 
                {
                    color: var(--border);
                } 
                
                ui-modal > div { width: 30em; }

            </style>

            <i class="fas fa-user"></i>
            <div hidden>
                <aside>
                    <div account href="https://www.voxxlr.com/account.html"><i class="fas fa-cog"></i><span>Account</span></div>
                    <div account href="https://www.voxxlr.com/billing.html"><i class="fas fa-shopping-cart"></i><span>Billing</span></div>
                    <hr>
                    <div account id="question" href="javascript:;"><i class="fas fa-question"></i>Ask a Question</div>
                    <hr>
                    <div id="logout" hidden><i class="fas fa-sign-out-alt"></i>Logout</div>
                </aside>
            </div>
            
            <ui-modal hidden close>
                <div>
                    <h1>Ask a question</h1>
                    <p>Let us know if you need information about how to use the editor or if you require a specific feature. </p>
                    <va-contact></va-contact>
                </div>
            </ui-modal>
            
        `;
        
    
        this.dom.querySelector(":host > i").addEventListener("click", event => this.dom.querySelector(":host > div").hidden = false)
        this.dom.querySelector(":host > div").addEventListener("click", event=> this.dom.querySelector(":host > div").hidden = true)
        
        this.dom.querySelectorAll("aside div[href]").forEach(item => item.addEventListener("click", event=> 
        {
            let div = event.currentTarget;
            
            var href = div.getAttribute("href");
            //location.href = href;
            if (div.id === "question")
            {
                if (this.hasAttribute("token"))
                {
                    this.dom.querySelector("ui-modal").hidden = false;
                }
            }
            else
            {
                if (div.hasAttribute("account"))
                {
                    if (this.hasAttribute("token"))
                    {
                        href = href + `?token=${encodeURIComponent(this.getAttribute("token"))}`;
                    }
                }
                
                this.dispatchEvent(new CustomEvent("open-page", { detail: { href, name: div.querySelector("span").textContent, icon: div.querySelector("i").getAttribute("class") } }));
            }
        }));
        
        this.dom.getElementById("logout").addEventListener("click", event =>  this.dispatchEvent(new CustomEvent('logout', {})));
    }
    
    attributeChangedCallback(name, oldValue, newValue)
    {
    }
}

customElements.define("va-settings", VaSettings);




/*
                    
                function updateMeter()
                {
                    fetch('https://www.voxxlr.com/meter', 
                    { 
                        method: 'GET', 
                        headers: new Headers({
                         'Authorization': `Bearer ${login.getToken()}`, 
                         'Content-Type': "application/json",
                         'Content-Encoding': 'gzip'
                        })
                    }).then(async (response) =>
                    {
                        let meter = await response.json();
                        if (meter.processing.length)
                        {
                            status.textContent = `currently processing ${meter.processing.length} datasets`;
                        }
                        else
                        {
                            status.textContent = "";
                        }
                    })
                }
                let timer = null;
                updateMeter();
                timer = setInterval(updateMeter, 1000*60*5);
            
                if (timer)
                {
                    status.textContent = "";
                    clearTimeout(timer);				
                }
            
*/

