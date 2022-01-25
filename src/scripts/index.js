import '../styles/index.scss';

import { LitElement, html, css } from 'lit';

/**
 * Form Address component
 * Communicates with API and helps user to define a given address
 */
export class FormAddress extends LitElement {

    constructor() {
        super();
        this.zipcode = '';
        this.baseAPIURL = 'https://cors-anywhere.herokuapp.com/https://www.postdirekt.de/plzserver/PlzAjaxServlet';
    }

    static styles = css`
        form {
            width: 50%;
            margin: 0 auto;
        }
        .row {
            display: flex;
            margin: 15px 0;
            justify-content: space-between;
        }
        select {
            width: 167px;
            padding: 12px;
        }
        label {
            width: 105px;
            display: inline-block;
        }
        select, input[type=number], input[type=text] {
            border-radius: 5px;
            border: 1px solid #CCC;
        } 
        input[type=number], input[type=text] {
            padding: 10px;
        }
        .wrapper {
            width: 1200px;
            margin: 0 auto;
        }
        .toggleBtn {
            padding: 10px 30px;
            display: block;
            margin: 0 auto;
        }
        code {
            font-size: 120%;
        }
        pre code {
            margin-bottom: 100px;
            background-color: #eee;
            border: 1px solid #999;
            display: block;
            padding: 20px;
        }
    `;

    // Define data property: used to store data from the API
    static get properties() {
        return {
            data: { type: Object },
            city: { type: String },
            zipcode: { type: Number },
            streets: { type: Array },
            houseNumber: {type: Number },
            showInfo: { type: Boolean }
        };
    }

    /**
     * @method getData - Pulls the data from the API
     */
    async getData() {

        const res = await fetch(this.baseAPIURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            body: 'finda=city&city='+ this.zipcode +'&lang=de_DE'
        });
        
        return res.json();
    }

    /**
     * @method onZipCodeKeyDown - Validates zipcode
     * @param {*} e 
     */
    onZipCodeKeyDown(e) {
        // Retrict to 5 chars and numbers
        const key = e.which ? e.which : e.keyCode;

        if ((e.target.value.length >= 5 &&
                key !== 8 &&
                key !== 37 &&
                key !== 38 &&
                key !== 39 &&
                key !== 9 &&
                key !== 40)
        ) {
            e.preventDefault();
        }
    }

    /**
     * @method onKeyUp - Updates component state
     * @param {*} e 
     */
    async onZipCodeKeyUp(e) {
        // Call API when zipcode is valid
        if (e.target.value.length === 5) {

            //Set the zipcode
            this.zipcode = e.target.value;

            // Get the data from API
            const apiData = await this.getData();

            // Set component properties
            this.city = await new Set(apiData.rows?.map(data => data.city));
            this.streets = await apiData.rows?.map(data => (data.street)? data.street : data.district);
        }
    }

    /**
     * @method setHouseNumber - Store the user data into state
     * @param {*} e 
     */
    setHouseNumber(e) {
        this.houseNumber = e.target.value;
    }

    /**
     * @method showInfo - Toggle the info window
     */
    toggleInfo() {
        this.showInfo = !this.showInfo;
        console.log('this.showInfo', this.showInfo);
    }

    render() {
        return html`
            <div class="wrapper">
                <form>
                    <div class="row">
                        <div class="field">
                            <label for="zipcode">Zipcode</label>
                            <input type="number" name="zipcode" @keydown=${this.onZipCodeKeyDown} @keyup=${this.onZipCodeKeyUp}>
                        </div>
                        <div class="field">
                            <label for="city">City</label>
                            <select name="city" disabled>
                                <option>${this.city}</option>
                            </select>
                        </div>
                    </div>
                    <div class="row">
                        <div class="field">
                            <label for="street">Street/District</label>
                            <select name="street">
                                ${this.streets?.map(data => 
                                    html`<option>${data}</option>`
                                )}
                            </select>
                        </div>
                        <div class="field">
                            <label for="houseNumber">House Number</label>
                            <input type="text" name="house-number" @keyup=${this.setHouseNumber}>
                        </div>
                    </div>
                    <div class="row">
                        <div class="field">
                            <label for="zipcode">Country</label>
                            <input type="text" name="country" value="Deutschland" disabled>
                        </div>
                    </div>
                </form>
                <button class="toggleBtn" @click=${this.toggleInfo}>Info</button>

                ${(this.showInfo) && 
                    html `<pre>
                            <code>
                                {
                                    "zipcode": "${this.zipcode}"
                                    "city": "${this.city}",
                                    "streets": ${this.streets},
                                    "houseNumber": ${this.houseNumber}
                                }
                            </code>
                        </pre>`
                }
            </div>
    `;
    }
}

customElements.define('form-address', FormAddress);
