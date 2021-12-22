class VaApiKey extends HTMLElement 
{
    constructor() 
    {
        super();
        
        this.dom = this.attachShadow({mode: 'open'});
        this.dom.innerHTML = `
        
            <style>
            
                :host
                {
                    display: flex; 
                    flex-direction: column;
                }
                
                ui-tag-list 
                {
                    margin-top: 1em;
                    margin-bottom: 2em;
                }
                
                .dataset
                {
                    display: flex;
                    align-items: center;
                    border: 1px solid var(--border);
                    padding: 1em 1em 2em 1em;
                }
                .dataset[selected] { border: 2px solid var(--primary); }
                .dataset:not(:first-child) { margin-top: 0.5em; }
                .dataset[hidden] { display: none; }
                
                .dataset > input { margin-right: 1em; }

                img 
                {
                    display: block;
                    margin: 0px;
                    padding: 0px;
                    width: 100%;
                    height: 100%;
                }				
                
                .document p 
                {
                    position: relative;
                    bottom: 2em;
                    height: 2em;
                    line-height: 2em;
                    padding: 0px;
                    margin: 0px;
                    text-align: center;
                    vertical-align: middle;
                    color: white;
                    display: block;
                    background-color: rgba(0, 0, 0, 0.5);
                }
                
                vx-dataset-info { position:absolute; bottom:0; }				
                
            </style>
        
            <div class="dataset">
                <input type="checkbox" name="tags">
                <div>
                    <p>Define the keywords identifying the dataset which this App can access</p> 
                    <ui-tag-list tags="" disabled>
                        <ui-tag-input placeholder="tags..." type="text" ></ui-tag-input>
                    </ui-tag-list>
                </div>
            </div>
            <div class="dataset">
                <input type="checkbox" name="document">
                <div>
                    <p>Select the initial document top load</p> 
                    <div class="document">
                        <img src="https://voxxlr.github.io/www/images/camera.webp">
                        <p></p>
                    </div>
                </div>
            </div>

            <ui-modal id="inventory-dialog" hidden close>
                
            </ui-modal>
            
        `;
        
        this.dom.querySelectorAll("input").forEach(item=>item.addEventListener("change", async (event) =>
        {
            let checkbox = event.currentTarget;
            if (checkbox.getAttribute("name") === "document")
            {
                if (checkbox.checked)
                {
                    this.dispatchEvent(new CustomEvent("select-document", { composed: true, bubbles: true }));
                    
                    let dialog = this.dom.querySelector("ui-modal");
                    if (!this.inventory)
                    {
                        this.inventory = document.createElement("vx-inventory");
                        await fetch(`https://www.voxxlr.com/key`, 
                        { 
                            headers: new Headers({ 'Authorization': `Bearer ${this.getAttribute("token")}` }),
                    
                        }).then(async (response) =>
                        {
                            this.inventory.setAttribute("key", await response.text());
                            this.inventory.appendChild(document.createElement("vx-search-filter"));
                            this.inventory.appendChild(document.createElement("vx-dataset-info"));
                            this.dom.querySelector("ui-modal").appendChild(this.inventory);
                        });
                    }
                    dialog.hidden = false;
                    checkbox.checked = false;
                }
                else
                {
                    checkbox.parentElement.toggleAttribute("selected", false);
                    this.image.src = "https://voxxlr.github.io/www/images/camera.webp";
                    
                    delete this.key.data.id;
                    this.update()
                }
            }
            else
            {
                let taglist = this.dom.querySelector("ui-tag-list");
                if (checkbox.checked)
                {
                    taglist.toggleAttribute("disabled", false)
                    this.key.data.tags = taglist.get();
                }
                else
                {
                    taglist.toggleAttribute("disabled", true)
                    taglist.setAttribute("tags", "")
                    delete this.key.data.tags;
                }
                checkbox.parentElement.toggleAttribute("selected", event.currentTarget.checked);
                this.update()
            }
        }));
        
        this.dom.querySelector("ui-tag-list").addEventListener("tags-changed", event=>
        {
            this.key.data.tags = event.currentTarget.get();
            this.update()
        })
        
        this.currentDataset = null;
        
        this.image = this.dom.querySelector("img");
        this.image.onerror = () =>
        {
            this.image.src = "https://voxxlr.github.io/www/images/camera.webp";
        }
        
        window.addEventListener("message", async (event) =>
        {
            if (event.data.action == "dataset-load")
            {
                let dataset = event.data.dataset;
                
                this.currentDataset = dataset.id;
                this.image.src = dataset.meta.preview;
                this.dom.querySelector(".dataset:nth-of-type(2)").toggleAttribute("selected", true);
                this.dom.querySelector("input[name='document']").checked = true;
                
                if (this.key)
                {
                    if (!this.dom.querySelector(":scope > div:nth-of-type(2)").hidden)
                    {
                        let input = this.dom.querySelector("input[name='document']");
                        if (input.checked)
                        {
                            this.key.data.id = this.currentDataset;
                            this.update();
                        }
                    }
                }
                
                this.dom.querySelector("ui-modal").hidden = true;
            }
        });
        
    }
    
    update()
    {
        fetch(`https://www.voxxlr.com/key/${this.key.id}`, 
        { 
            method: 'PUT', 
            headers: new Headers({
             'Authorization': `Bearer ${this.getAttribute("token")}`, 
             'Content-Type': "application/json",
             'Content-Encoding': 'gzip'
            }),
            body: JSON.stringify(this.key)
        }); 
    }

    async create(manifest)
    {
        let data = {};
        
        if (manifest.document)
        {
            let input = this.dom.querySelector("input[name='document']");
            if (input.checked)
            {
                data.id = this.currentDataset;
            }
        }

        if (manifest.tags)
        {
            let tags = this.dom.querySelector("input[name='tags']");
            if (tags.checked)
            {
                data.tags = this.dom.querySelector("ui-tag-list").get();
            }
        }
        
        let key;
        
        await fetch(`https://www.voxxlr.com/key`, 
        { 
            method: 'POST',
            headers: new Headers({
             'Authorization': `Bearer ${this.getAttribute("token")}`, 
             'Content-Type': "application/json",
             'Content-Encoding': 'gzip'
            }),
            body: JSON.stringify({ data,  permission: "W", name: "link" })
    
        }).then(async (response) =>
        {
            key = await response.text();
        });
        
        return key;
    }
    
    async delete(key)
    {
        return fetch(`https://www.voxxlr.com/key/${key}`, 
        { 
            method: 'DELETE',
            headers: new Headers({
             'Authorization': `Bearer ${this.getAttribute("token")}`, 
            })
        });
    }

    setManifest(manifest)
    {
        this.dom.querySelector(":host > div:nth-of-type(1)").hidden = !manifest.tags;
        this.dom.querySelector(":host > div:nth-of-type(2)").hidden = !manifest.document;
        this.dom.querySelector(":host > div:nth-of-type(2)")
    }		

    clrKey()
    {	
        delete this.key;
    }	

    async setKey(key)
    {		
        return fetch(`https://www.voxxlr.com/key/${key}`, 
        { 
            headers: new Headers({ 'Authorization': `Bearer ${this.getAttribute("token")}` }),
    
        }).then(async (response) =>
        {
            this.key = await response.json();
            
            // display selected document
            let input = this.dom.querySelector("input[name='document']");
            if (!this.dom.querySelector(":host > div:nth-of-type(2)").hidden && this.key.data.id)
            {
                input.checked = true;
                input.parentNode.toggleAttribute("selected", true);
                
                fetch(`https://www.voxxlr.com/token/${this.key.data.id}`, 
                {
                    headers: new Headers({ 'Authorization': `Bearer ${this.getAttribute("token")}`}),
                }).then(async (response) =>
                {
                    let token = await response.text();
                    if (response.ok)
                    {
                        fetch(`https://doc.voxxlr.com/file/preview.jpg`, 
                        {
                            headers: new Headers({ 'Authorization': `Bearer ${token}` }),
                        }).then(async (response) =>
                        {
                            let file = await response.json();
                            this.image.src = file.url;
                        });
                    }
                    else if (response.status == 410)
                    {
                        this.image.src = "https://voxxlr.github.io/www/images/deleted.webp";
                    }
                });
                
                this.currentDataset = this.key.data.id;
            }
            else
            {
                this.image.src = "https://voxxlr.github.io/www/images/camera.webp";
                input.checked = false;
                input.parentNode.toggleAttribute("selected", false);
            }
    
            // display selected tags
            input = this.dom.querySelector("input[name='tags']");
            input.checked = this.key.data.tags != null;
            input.parentNode.toggleAttribute("selected", input.checked);
            let taglist = this.dom.querySelector("ui-tag-list");
            taglist.toggleAttribute("disabled", !input.checked);

            if (!this.dom.querySelector(":scope > div:nth-of-type(1)").hidden && this.key.data.hasOwnProperty("tags"))
            {
                taglist.setAttribute("tags", this.key.data.tags.join(",") || "");
            }
            else
            {
                this.dom.querySelector("ui-tag-list").setAttribute("tags", "");
            }			
        });
    }
}

customElements.define("va-apikey", VaApiKey);


class VaLinks extends HTMLElement 
{
    static get observedAttributes() 
    {
        return ['manifest', 'app'];
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
                    display: grid;
                    grid-template-areas:
                        'links auth data'
                        'links auth data'
                        'links permission data';
                    grid-gap: 1em;
                    grid-template-columns: minmax(32em, auto) 17em 25em;
                    overflow: hidden;
                }
                
                ui-section[name="links"] {grid-area: links; }
                ui-section[name="auth"] { grid-area: auth; }
                ui-section[name="data"] { grid-area: data; }
                ui-section[name="perm"] { grid-area: permission; }
                
                ui-section[name="links"] > div:nth-of-type(1) 
                {
                    display: flex;
                    align-items: center;
                }
                ui-section[name="links"] > div:nth-of-type(2) 
                {
                    overflow-y: auto; 
                    flex: 1;
                }
                
                #create span { line-height: 2em }

                .link
                {
                    flex: 1;					
                    position: relative;
                    background-color: var(--primary-transparent);
                    border: 1px solid var(--border);
                    border-radius: 6px;
                    padding: 0.5em;
                    margin-left: 1em;
                }

                .link > span
                {
                    white-space: nowrap;
                    height: 1.4em;
                    font-size: 1.2em;
                }
                
                .link > i 
                { 
                    color: var(--primary);
                    float: right;
                }
                    
                table
                {
                    margin-top: 1em;
                    display: block;
                    border-collapse: collapse;
                    white-space: nowrap;
                    overflow-y: auto;
                } 
                tr[selected] { background-color: var(--selected); }
                
                th
                {
                    border-top: 1px solid rgba(0,0,0,.12);
                    border-bottom: 1px solid rgba(0,0,0,.12);
                    padding: 4px 4px 4px 4px;
                    box-sizing: border-box;
                    white-space: nowrap;
                    overflow: hidden;
                    font-weight: 700;
                    letter-spacing: 0;
                    font-size: 0.9em;
                    box-sizing: border-box;
                    text-align: left;				
                    color: rgba(0,0,0,.54);
                }
                th:nth-of-type(2) {  width: 100%; }
                th:nth-of-type(4) { text-align: right; }

                td 
                {
                    border-top: 1px solid rgba(0,0,0,.12);
                    border-bottom: 1px solid rgba(0,0,0,.12);
                    padding: 4px 4px 4px 4px;
                    box-sizing: border-box;
                    white-space: nowrap;
                    overflow: hidden;
                    color: rgba(0,0,0,.54);
                }				
                td:nth-of-type(2) {  
                
                    text-overflow: ellipsis;
                    letter-spacing: 0;
                    font-size: 12px;
                    box-sizing: border-box;
                    text-align: left;				
                    width: 100%;
                }
                td:nth-of-type(4) { text-align: right; }
                    
                tr.invalid { background-color: var(--severe)}			
                
                .user
                {
                    padding: 1em;
                    min-height: 10em;
                    display: flex;
                    flex-direction: column;
                    align-items: stretch;
                    justify-content: center;
                }
                .user:not(:first-child) { margin-top: 0.5em; }
                .user > div { margin-left: 1em; }
                .user input { margin-top: 1em }
                
                
                ui-section[name="perm"] ui-button-group { margin: 1em auto; }
                
            </style>

            <template>
                <tr>
                    <td><input type='checkbox'/></td>
                    <td contenteditable='true'></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr> 
            </template>

            <ui-section name="links" label="Active Links">
                <div>
                    <button id="create" class="vx-tool vx-secondary"><i></i>
                        <span>Create Link</span>
                    </button>
                    <div class="link">
                        <span></span>
                        <i class="fas fa-copy"></i>
                        <ui-tooltip hidden>
                            <p>Click to copy the App link</p>
                        </ui-tooltip>
                    </div>
                </div>
                
                <div>
                    <table >
                        <thead>
                            <tr>
                                <th>
                                    <input type="checkbox" disabled>
                                </th>											
                                <th>Name</th>
                                <th>App</th>
                                <th>Views</th>
                                <th>
                                    <ui-button-group spring>
                                        <button disabled class="vx-secondary" hidden><i class="fas fa-eye"></i></button>
                                        <button disabled class="vx-secondary"><i class="fas fa-trash"></i></button>
                                    </ui-button-group>
                                </th>
                            </tr>
                        </thead>
                        <tbody class="list">
                        </tbody>
                    </table>
                </div>
            </ui-section>
                
            <ui-section name="auth" label="Authentication" disabled>
                <ui-list>
                    <div id="anyone" class="user" selected>
                        <span>Anyone with access to the link</span>
                    </div>
                    <div id="password" class="user">
                        <span>Anyone with password</span>
                        <input id="password" type="text" required="" placeholder="Enter password ..." disabled>
                    </div>
                    <!--
                    <div id="emails" class="user">
                        <span>Users with the following email address. Must be able to authenticate with their Google, LinkedIn or Microsoft account</span>
                    </div>
                    -->
                </ui-list>
            </ui-section>

            <ui-section name="perm" label="Permission" disabled>
                <p>Full Access provides a save button and allows users to change content</p>
                <ui-button-group single required>
                    <button id="W" class="vx-primary" active>Full Access</button>
                    <button id="R" class="vx-primary">Read Only</button>
                </ui-button-group>
            </ui-section>

            <ui-section name="data" label="Datasets" disabled>
                <va-apikey></va-apikey>
            </ui-section>

            `;
            
        //
        // create
        //
                
        this.link = this.dom.querySelector(".link");
        this.link.addEventListener('click', ()=> { navigator.clipboard.writeText(this.link.querySelector("span").textContent) });

        this.dom.getElementById("create").addEventListener("click", async (event) =>
        {
            let manifest = window.MANIFESTS[this.getAttribute("app")];
            
            let key = await this.apiKey.create(manifest);
            let auth = {};
            
            fetch(`https://www.voxxlr.com/link`, 
            { 
                method: 'POST', 
                headers: new Headers({
                 'Authorization': `Bearer ${this.getAttribute("token")}`, 
                 'Content-Type': "application/json",
                 'Content-Encoding': 'gzip'
                }),
                body: JSON.stringify({ app: this.getAttribute("app"), key, auth, name: "link name" })
            }).then(async (response) => 
            {
                let tr = this.createRow(await response.json());
                tr.dispatchEvent(new CustomEvent("click"));
            });
        });
        
        //
        // table
        //
        this.table = this.dom.querySelector("table");
        this.template = this.dom.querySelector("template");
    
        this.selectAll = this.table.querySelector('th input[type=checkbox]');
        this.selectAll.addEventListener('change', (event) => 
        {
            if (event.target.checked) 
            {
                this.table.querySelectorAll('tbody tr').forEach(row =>
                {
                    row.querySelector('input').checked = true;
                });
                this.delete.disabled = false;
            } 
            else 
            {
                this.dom.querySelectorAll('tbody input').forEach((value) =>
                {
                    value.checked = false;
                });
                this.delete.disabled = true;
            }
        });
        
        this.delete = this.dom.querySelector("th button:nth-child(2)");
        this.delete.addEventListener('click', async () =>
        {
            this.delete.disabled = true;
            
            this.data.toggleAttribute("disabled",true);
            this.auth.toggleAttribute("disabled",true);
            this.perm.toggleAttribute("disabled",true);

            let list = this.dom.querySelectorAll("tbody input:checked");
            for (var i=0; i<list.length; i++)
            {
                var row = list[i].parentNode.parentNode;
                row.remove();
                if (row.hasAttribute("selected"))
                {
                    this.data.toggleAttribute("disabled",true);
                    this.auth.toggleAttribute("disabled",true);
                    this.perm.toggleAttribute("disabled",true);
                    this.apiKey.clrKey();
                }

                await this.apiKey.delete(row.content.key);
                await fetch(`https://www.voxxlr.com/link/${row.content.id}`, 
                { 
                    method: 'DELETE', 
                    headers: new Headers({ 'Authorization': `Bearer ${this.getAttribute("token")}` })
                }); 
            }
            
            this.selectAll.disabled = this.dom.querySelectorAll("tbody tr").length == 0;
            this.selectAll.checked = false;
        });		
        
        //
        // data
        //
        this.data = this.dom.querySelector("ui-section[name='data']");
        this.apiKey = this.dom.querySelector("va-apikey");
        
        //
        // Authentication
        //
        this.auth = this.dom.querySelector("ui-section[name='auth']");
        this.auth.querySelector("ui-list").addEventListener("item-select", event=>
        {
            let row = this.dom.querySelector('tr[selected]');
            if (event.detail.id === "anyone")
            {
                row.content.auth = {};
                let password = this.auth.querySelector("#password input");
                password.disabled = true;
            }
            else if (event.detail.id === "password")
            {
                row.content.auth = { password: "password" };
                let password = this.auth.querySelector("#password input");
                password.disabled = false;
            }
            else if (event.detail.id === "emails")
            {
                //row.content.auth = { password: "password" };
            }
            this.update(row.content)
        });
        this.auth.querySelector("#password > input").addEventListener("focusout", (event) =>
        {
            var row = this.table.querySelector("tr[selected]");
            row.content.auth.password = event.currentTarget.value;
            this.update(row.content);
        });
        
        
        //
        // Permission
        //
        this.perm = this.dom.querySelector("ui-section[name='perm']");
        this.perm.querySelector("ui-button-group").addEventListener("down", event=>
        {
            this.apiKey.key.permission = event.detail.id;
            this.apiKey.update()
        });
        
    }
    
    connectedCallback()
    {
        this.apiKey.setAttribute("token", this.getAttribute("token"));
        
        fetch(`https://www.voxxlr.com/link`, 
        {
            method: 'GET', 
            headers: new Headers({
             'Authorization': `Bearer ${this.getAttribute("token")}`, 
             'Content-Type': "application/json",
             'Content-Encoding': 'gzip'
            })
        }).then(async (response) =>
        {
            let list = await response.json();
            list.forEach(entry =>
            {
                this.createRow(entry);
            });
        });
    }
    
    attributeChangedCallback(name, oldValue, newValue)
    {
        if (name == "app")
        { 
            let manifest = window.MANIFESTS[newValue];
            this.apiKey.setManifest(manifest);
            this.dom.querySelector("#create i").setAttribute("class", `fas fa-2x ${manifest.icon}`);
        }
    }
        
    createRow(item, icon)
    {
        this.selectAll.disabled = false;
        
        let manifest = window.MANIFESTS[item.app]

        
        let tr = this.template.content.cloneNode(true).firstElementChild;
        tr.content = item;
        tr.id = item.id;
        let name = tr.querySelector("td:nth-of-type(2)")
        name.textContent = item.name;
        name.addEventListener("focusout", this.editTitle.bind(this));
        tr.querySelector("td:nth-of-type(4)").textContent = item.views;
        if (manifest)
        {
            tr.querySelector("td:nth-of-type(3)").textContent = manifest.title;
            tr.addEventListener("click", this.selectRow.bind(this));
        }
        else
        {
            tr.querySelector("td:nth-of-type(3)").textContent = "Invalid App !!";
            tr.classList.add("invalid");
        }
        tr.addEventListener("change", this.selectCheckbox.bind(this));
        this.dom.querySelector('tbody').appendChild(tr);
        return tr;
    };
        
    editTitle(event)
    {
        var row = event.currentTarget.parentElement;
        if (row.content.name !== event.currentTarget.textContent)
        {
            row.content.name = event.currentTarget.textContent;
            this.update(row.content);
        }
    };
    
    selectCheckbox(event)
    {
        this.delete.disabled = this.dom.querySelector('tbody input:checked') == null;
        event.preventDefault();
    }
    
    update(entry)
    {
        fetch(`https://www.voxxlr.com/link/${entry.id}`, 
        { 
            method: 'PUT', 
            headers: new Headers({
             'Authorization': `Bearer ${this.getAttribute("token")}`, 
             'Content-Type': "application/json",
             'Content-Encoding': 'gzip'
            }),
            body: JSON.stringify(entry)
        }); 
    }

    async selectRow(event)
    {
        this.data.toggleAttribute("disabled",false);
        this.auth.toggleAttribute("disabled",false);
        this.perm.toggleAttribute("disabled",false);
        
        if (!event.currentTarget.classList.contains("selected"))
        {
            var selected = this.dom.querySelector('tr[selected]');
            if (selected != null)
            {
                selected.toggleAttribute("selected");
            }
            event.currentTarget.toggleAttribute("selected");

            let entry = event.currentTarget.content;
            this.link.querySelector("span").textContent = entry.url;

            this.apiKey.setManifest(window.MANIFESTS[entry.app]);
            await this.apiKey.setKey(entry.key);

            // display auth
            if (entry.hasOwnProperty("auth"))
            {
                this.auth = this.dom.querySelector("ui-section[name='auth']");
                if (entry.auth.password)
                {
                    this.auth.querySelector("ui-list").select(this.dom.getElementById("password"));
                    
                    let input = this.auth.querySelector("#password input");
                    input.value = entry.auth.password;
                    input.disabled = false;
                }
                else
                {
                    this.auth.querySelector("ui-list").select(this.dom.getElementById("anyone"));
                    let password = this.dom.getElementById("password");
                    password.querySelector("input").value = "";
                }
                
                this.dom.getElementById("W").toggleAttribute("active",this.apiKey.key.permission === "W");
                this.dom.getElementById("R").toggleAttribute("active",this.apiKey.key.permission === "R");
            }	
            else
            {
                this.auth.querySelector("ui-list").select(this.dom.getElementById("anyone"));
                let password = this.dom.getElementById("password");
                password.querySelector("input").value = "";
            }
        }
    };	
    
    async reset()
    {
        var selected = this.dom.querySelector('tr[selected]');
        if (selected != null)
        {
            selected.toggleAttribute("selected");
            this.data.toggleAttribute("disabled",true);
            this.auth.toggleAttribute("disabled",true);
            this.apiKey.clrKey();
        }
    }

}

customElements.define("va-links", VaLinks);

