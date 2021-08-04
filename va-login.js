class VaLogin extends HTMLElement 
{
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
                    align-items: stretch;
                    width: 20em;
                }
                
                :host > div { margin-bottom: 1em; }
                
                div.buttons
                { 
                    display: flex;
                    flex-direction: column;
                    align-items: stretch;
                }
            
                div.buttons > button 
                { 
                    height: 2.3em; 
                    margin-bottom: 0.5em; 
                }
            
                #google { background: #e93f2e; color: white; }
                #linkedin { background: #0e76a8; color: white; }
                #microsoft { background: #0093D6; color: white; }
                
            </style>

            <div>
                <p>A free trial account is automatically created for you when you first log in. <!--By logging in you agree to our<a href="/account/service.html" target="_blank">Terms of Service</a>--!></p><br>
            </div>	
            <div class="buttons">
                <button id="google" class="google">Sign In with Google</button>
                <button id="linkedin" class="linkedin">Sign In with LinkedIn</button>
                <button id="microsoft" class="microsoft">Sign In with Microsoft</button>
            </div> 
            <p>You can also join an existing account by entering the account email address below. </p>
            <input placeholder="Join Account ..." type="text"><span></span>
            <p>The owner of this account must have invited you in order to for you to join.</p>
        `;
        
        this.dom.querySelectorAll("button").forEach((item) =>
        {
            item.addEventListener("click", (event) =>
            {
                var left = (screen.width/2)-(400/2);
                var top = (screen.height/2)-(400/2);
    
                var join = this.dom.querySelector("input").value;
                if (join)
                {
                    join = "&state=" + join;	
                }
                else
                {
                    join = "&state=" + Math.floor((Math.random() * 1000) + 1);
                }
                window.open(this.platforms[event.currentTarget.id]+join, "Login", "width=640, height=480, left="+left+", top="+top);
            });
        });
        
        window.addEventListener('message', (e) =>
        {
            switch (e.data.action)
            {
                case "login":
                    this.login(e.data.token);
                    break;
                case "logout":
                    window.sessionStorage.removeItem("voxxlr");
                    window.location = "https://www.voxxlr.com/index.html";
                    break;
            }
        });
    }
    
    connectedCallback() 
    {
        this.platforms = 
        {
            google: `https://accounts.google.com/o/oauth2/auth?scope=email&response_type=code&redirect_uri=https://www.voxxlr.com/login/google&client_id=844254889687-q3ecf8h7sru9vm695ok81ctln4moc0gm.apps.googleusercontent.com`,
            linkedin: `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=863i9i5ybvv6hd&scope=r_emailaddress&redirect_uri=https://www.voxxlr.com/login/linkedin;`,
            microsoft: `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=ccd8e874-3b2a-428c-a68c-aaf507b947ea&scope=user.read&response_type=code&redirect_uri=https://www.voxxlr.com/login/microsoft`
        }
    }
    
    init()
    {
        var results = new RegExp('[\?&]token=([^&#]*)').exec(window.location.href);
        if (results==null)
        {
            let session = window.sessionStorage.getItem("voxxlr");
            if (session)
            {
                this.login(session);
            }
            else
            {
                this.logout();
            }
        }
        else
        {
            this.login(decodeURIComponent(results[1]));
        }
    }
    
    logout()
    {
        window.sessionStorage.removeItem("voxxlr");
        this.dispatchEvent(new CustomEvent('logout', { bubbles: true }));
    }
    
    login(token)
    {
        window.sessionStorage.setItem("voxxlr", token);
        this.dispatchEvent(new CustomEvent('login',  { bubbles: true, detail: token }));
    }
    
    getToken()
    {
        return window.sessionStorage.getItem("voxxlr");
    }

}
    
customElements.define("va-login", VaLogin);



class VaContact extends HTMLElement 
{
    constructor() 
    {
        super();
        
        this.dom = this.attachShadow({mode: 'open'});
        this.dom.innerHTML = `
    
            <link rel="stylesheet" href="https://voxxlr.github.io/app/ui.css">

            <style>
            
                :host
                {
                    flex: 1;
                    display: flex;
                    flex-direction: column;

                    font-style: italic;
                }
                
                :host > * { margin-top: 1em; }
                
                textarea { resize: none; }
                button { margin-right: 3em; }
                
                :host > div
                {
                    
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                
                :host([hidden]) { display: none }
                
            </style>
            <input placeholder="name" type="text"></input>
            <input placeholder="email" type="email"></input>
            <textarea placeholder="comment" rows=12></textarea>
            <div>
                <slot></slot>
                <button disabled>Submit</button>
            </div>
            
            <ui-modal local hidden>Your request has been received. We will be in touch shortly...</ui-modal>
            
        `;	
        
        window.onSubmit = (event)=>
        {
            this.dom.querySelector("button").disabled = !this.dom.querySelector("input[type='email']").value;
        };
        
        this.dom.querySelector("input[type='email']").addEventListener("change", event=>
        {
            //this.dom.querySelector("button").disabled = (this.getAttribute("sitekey") ? grecaptcha.getResponse() === "" : false) || !event.currentTarget.value;
            this.dom.querySelector("button").disabled = !event.currentTarget.value;
        });
        
        this.dom.querySelector("button").addEventListener("click", event=>
        {
            fetch(`https://www.voxxlr.com/ask`, 
            { 
                method: 'POST', 
                headers: new Headers({
                 'Authorization': `Bearer ${this.getAttribute("token")}`, 
                 'Content-Type': "application/json",
                 'Content-Encoding': 'gzip'
                }),
                body: JSON.stringify({ 
                    email: this.dom.querySelector("input[type='email']").value, 
                    name: this.dom.querySelector("input[type='text']").value, 
                    content: this.dom.querySelector("textarea").value 
                    })
            }).then(async (response) => 
            {
                this.dom.querySelector("ui-modal").hidden = false;
                setTimeout(()=>
                {
                    this.dom.querySelector("ui-modal").hidden = true
                    this.closest("ui-modal").hidden = true;	
                }, 2500);
            });			
        });
            
    }
    connectedCallback() 
    {
        /*
        if (this.hasAttribute("sitekey") && false)
        {
            this.innerHTML = `<div class="g-recaptcha" data-sitekey="${this.getAttribute("sitekey")}" data-callback="onSubmit"></div>`;
        }
        */
        if (this.hasAttribute("email"))
        {
            this.dom.querySelector("input[type='email']").value = this.getAttribute("email");
        }
        //this.innerHTML = `<button class="g-recaptcha" data-sitekey="6LcB8lAaAAAAAL0mvZxDxXuXljP-0boKPd-3aiuX" data-callback="onSubmit">Submit</button>`
        
    }

}

customElements.define("va-contact", VaContact);