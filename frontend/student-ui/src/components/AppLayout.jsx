// AppLayout.jsx
import { Layout } from "antd";
import { Outlet } from "react-router-dom";
const { Header, Content } = Layout;

export default function AppLayout() {
  return (
    <Layout style={{ minHeight: "100dvh" }}>
      <Header style={{ background:"#141414", color:"#fff" }}>🎓 Student Automation</Header>
      <Content style={{ padding: 20 }}>
        <Outlet />
      </Content>
    </Layout>
  );
}
