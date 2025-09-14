import {useState, useEffect } from "react";
import { Row, Col, Card, Statistic, Button, Space, message } from "antd";
import { useNavigate } from "react-router-dom";
import { UsersApi } from "../../api/users";
import { CoursesApi } from "../../api/courses";

export default function TeacherDashboard() {
    const [stats, setStats] = useState({students: 0, courses:0});
    const [loading, setLoading] = useState(false);
    const nav = useNavigate();

    const loadAll = async () => {
        setLoading(true);
        try {
            const [s, c] = await Promise.all([
                UsersApi.listStudents(),
                CoursesApi.list(),
            ]);
            setStats({ students: s.data.length, courses: c.data.length });
        } catch (e) {
            console.error(e);
            message.error("Veriler yüklenemedi");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadAll(); }, []);

    return (
        <>
            <Row gutter={[16,16]} style={{marginBottom:16}}>
                <Col xs={24} md={24}>
                    <Card loading={loading}><Statistic title="Students" value={stats.students} valueStyle={{ fontSize: 32 }}/></Card>
                </Col>
                <Col xs={24} md={24}>
                    <Card loading={loading}><Statistic title="Courses" value={stats.courses} valueStyle={{ fontSize: 32 }}/></Card>
                </Col>
            </Row>

            <Card>
                <Space wrap>
                    <Button type="primary" onClick={() => nav("/teacher/students")}>
                        Manage Students
                    </Button>
                    <Button type="primary" onClick={() => nav("/teacher/courses")}>
                        Manage Courses
                    </Button>
                </Space>
            </Card>
        </>
    )
}