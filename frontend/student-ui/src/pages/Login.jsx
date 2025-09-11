import { useState } from "react";
import { Tabs, Form, Input, Button, Card, message } from "antd";
import { useNavigate } from "react-router-dom";
import { AuthApi } from "../api/auth";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const [tab, setTab] = useState("admin");
  const [loading, setLoading] = useState(false);
  const { refresh } = useAuth();
  const nav = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      if (tab === "admin")   await AuthApi.loginAdmin(values.userName, values.password);
      if (tab === "teacher") await AuthApi.loginTeacher(values.firstName, values.lastName, values.password);
      if (tab === "student") await AuthApi.loginStudent(Number(values.number), values.password);
      await refresh();
      nav("/");
    } catch {
      message.error("Giriş başarısız. Bilgileri kontrol edin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{overflow: "hidden", Height:"100dvh", display:"grid", placeItems:"center", padding:16, margin:100, background:"#141414" }}>
      <Card title="Student Automation System" style={{width:380}}>
        <Tabs activeKey={tab} onChange={setTab} items={[
          { key:"admin",   label:"Admin",   children:
            <Form layout="vertical" onFinish={onFinish}>
              <Form.Item name="userName" label="User Name" rules={[{required:true}]}>
                <Input />
              </Form.Item>
              <Form.Item name="password" label="Password" rules={[{required:true}]}>
                <Input.Password />
              </Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading}>Log In</Button>
            </Form>
          },
          { key:"teacher", label:"Teacher", children:
            <Form layout="vertical" onFinish={onFinish}>
              <Form.Item name="firstName" label="First Name" rules={[{required:true}]}><Input /></Form.Item>
              <Form.Item name="lastName"  label="Last Name" rules={[{required:true}]}><Input /></Form.Item>
              <Form.Item name="password"  label="Password" rules={[{required:true}]}><Input.Password /></Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading}>Log In</Button>
            </Form>
          },
          { key:"student", label:"Student", children:
            <Form layout="vertical" onFinish={onFinish}>
              <Form.Item name="number"   label="Student No" rules={[{required:true}]}><Input /></Form.Item>
              <Form.Item name="password" label="Password" rules={[{required:true}]}><Input.Password /></Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading}>Log In</Button>
            </Form>
          },
        ]}/>
      </Card>
    </div>
  );
}
