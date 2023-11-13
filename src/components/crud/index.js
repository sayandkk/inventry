import React from "react";
import StartFirebase from "../Firebaseconfig/index";
import { ref, set, get, update, remove, child } from "firebase/Database";


class Crud extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            db: '',
            username: '',
            fullname: '',
            phonenumber: '',
            dob: ''
        }
    }

    componentDidMount() {
        this.setState({
            db: StartFirebase()
        });
    }
    render() {
        return ()
    }
}