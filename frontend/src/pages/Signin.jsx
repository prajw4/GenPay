import { Heading } from "../components/Heading";
import { SubHeading } from "../components/SubHeading";
import { InputBox } from "../components/InputBox";
import { Button } from "../components/Button";
import { BottomWarning } from "../components/BottomWarning";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { useNotify } from '../context/NotificationContext'

export const Signin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate();
  const { push } = useNotify()

    return <div className="bg-slate-300 h-screen flex justify-center">
        <div className="flex flex-col justify-center">
        <div className="rounded-lg bg-white w-80 text-center p-2 h-max px-4">
            <Heading label={"Sign in"} />
            <SubHeading label={"Enter your credentials to access your account"} />
            <InputBox onChange={e => {
                setUsername(e.target.value);
                }} placeholder="harkirat@gmail.com" label={"Email"} />
            <InputBox onChange={(e) => {
                setPassword(e.target.value)
                }} placeholder="123456" label={"Password"} />
            <div className="pt-4">
            <Button
  loading={loading}
    onClick={async () => {
    setLoading(true)
    try {
      const response = await axios.post(
        "http://localhost:3000/api/v1/user/signin",
        { username, password },
        { headers: { "Content-Type": "application/json" } }
      );

      localStorage.setItem("token", response.data.token);
      push('Signed in', 'success')
      navigate("/dashboard");
    } catch (error) {
      console.warn('Signin failed', error)
      const message = error?.response?.data?.message || 'Signin failed — check your credentials'
      push(message, 'error')
    } finally {
      setLoading(false)
    }
  }}
  label={"Sign in"}
/>

            </div>
            <BottomWarning label={"Don't have an account?"} buttonText={"Sign up"} to={"/signup"} />
        </div>
        </div>
    </div>
}