import React from 'react'
import "./Login.css"
import { useNavigate } from 'react-router-dom'


function Login() {

    const navigate = useNavigate();
    return (






        <div className="middle">

            <div className="bg">

                <h1 className='log'> login</h1>

                <div class="form-container">
                    <form class="form">
                        <div class="form-group">
                            <label for="email">Email</label>
                            <input required="" name="email" id="email" type="text" />
                        </div>
                        <div class="form-group">
                            <label for="password">PASSWORD</label>
                            <input required="" name="email" id="email" type="text" />
                        </div>




                        <button type="submit" class="form-submit-btn" onClick={() => navigate("/home")} >


                            login






                        </button>
                    </form>
                </div>


            </div>
        </div>




    )
}

export default Login