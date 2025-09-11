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
      // 1) Giriş
      if (tab === "admin")   await AuthApi.loginAdmin(values.userName, values.password);
      if (tab === "teacher") await AuthApi.loginTeacher(values.firstName, values.lastName, values.password);
      if (tab === "student") await AuthApi.loginStudent(values.number, values.password);

      // 2) Cookie geldi mi doğrula
      const meRes = await AuthApi.me(); // 200 dönmeli
      // 3) Context tazele + yönlendir
      await refresh?.();
      message.success(`Welcome ${meRes?.data?.profile?.firstName ?? meRes?.data?.userName ?? ""}`);
      nav("/admin", { replace: true });
    } catch (err) {
      console.error("Login flow error:", err);
      message.error("Giriş başarısız. Bilgileri ve sunucu bağlantısını kontrol edin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        overflow: "hidden",
        height: "100dvh", // Height -> height
        display: "grid",
        placeItems: "center",
        padding: 16,
        background: "#141414",
      }}
    >
      <Card title="Student Automation System" style={{ width: 380 }}>
        <Tabs
          activeKey={tab}
          onChange={(k) => setTab(k)}
          items={[
            {
              key: "admin",
              label: "Admin",
              children: (
                <Form
                  layout="vertical"
                  onFinish={onFinish}
                  preserve={false}
                  autoComplete="off"
                  name="admin-login"
                >
                  <Form.Item name="userName" label="User Name" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                  <Form.Item name="password" label="Password" rules={[{ required: true }]}>
                    <Input.Password />
                  </Form.Item>
                  <Button type="primary" htmlType="submit" block loading={loading}>
                    Log In
                  </Button>
                </Form>
              ),
            },
            {
              key: "teacher",
              label: "Teacher",
              children: (
                <Form
                  layout="vertical"
                  onFinish={onFinish}
                  preserve={false}
                  autoComplete="off"
                  name="teacher-login"
                >
                  <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                  <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                  <Form.Item name="password" label="Password" rules={[{ required: true }]}>
                    <Input.Password />
                  </Form.Item>
                  <Button type="primary" htmlType="submit" block loading={loading}>
                    Log In
                  </Button>
                </Form>
              ),
            },
            {
              key: "student",
              label: "Student",
              children: (
                <Form
                  layout="vertical"
                  onFinish={onFinish}
                  preserve={false}
                  autoComplete="off"
                  name="student-login"
                >
                  <Form.Item name="number" label="Student No" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                  <Form.Item name="password" label="Password" rules={[{ required: true }]}>
                    <Input.Password />
                  </Form.Item>
                  <Button type="primary" htmlType="submit" block loading={loading}>
                    Log In
                  </Button>
                </Form>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
