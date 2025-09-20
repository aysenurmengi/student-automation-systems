import { useEffect, useState } from "react";
import { Row, Col, Card, Table, Statistic, message } from "antd";
import { http } from "../../api/http"

export default function StudentDashboard ()
{
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState(null);
    const [courses, setCourses] = useState([]);
    const [grades, setGrades] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [comments, setComments] = useState([]);

    const loadAll = async () => {
        setLoading(true);
        try {
            const [me, c, g, a, cm] = await Promise.all([
                http.get("/Auth/me"),
                http.get("/Courses/mine"),
                http.get("/Grades/my"),
                http.get("/Attendance/my"),
                http.get("/Courses/${courseId}/comments/mine")
            ]);
            setProfile(me.data);
            setCourses(c.data);
            setGrades(g.data);
            setAttendance(a.data);
            setComments(cm.data);

        } catch (e) {
            console.error(e);
            message.error("Veriler yüklenemedi");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {loadAll();}, []);

    return (
        <>
      <Row gutter={[16,16]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title={`Courses${profile?.profile?.firstName ? ` • ${profile.profile.firstName}` : ""}`}
              value={courses.length}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}><Card><Statistic title="Comments" value={comments.length} /></Card></Col>
        <Col xs={24} md={8}><Card><Statistic title="Attendance Entries" value={attendance.length} /></Card></Col>
      </Row>

      <Row gutter={[16,16]}>
        <Col xs={24} md={12}>
          <Card title="My Courses" loading={loading} size="small">
            <Table
              rowKey={(r) => r.courseId}
              size="small"
              dataSource={courses}
              columns={[
                { title: "Code", dataIndex: "code" },
                { title: "Name", dataIndex: "name" },
                { title: "Status", dataIndex: "status" },
              ]}
              pagination={{ pageSize: 6 }}
            />
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="My Grades" loading={loading} size="small">
            <Table
              rowKey={(r, i) => i}
              size="small"
              dataSource={grades}
              columns={[
                { title: "Course", dataIndex: "code", render: (_, r) => `${r.code} ${r.name}` },
                { title: "Attempt", dataIndex: "attempt" },
                { title: "Score", dataIndex: "score" },
              ]}
              pagination={{ pageSize: 6 }}
            />
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="My Attendance" loading={loading} size="small" style={{ marginTop: 16 }}>
            <Table
              rowKey={(r, i) => i}
              size="small"
              dataSource={attendance}
              columns={[
                { title: "Course", dataIndex: "code", render: (_, r) => `${r.code} ${r.name}` },
                { title: "Date", dataIndex: "date" },
                { title: "Status", dataIndex: "status" },
              ]}
              pagination={{ pageSize: 6 }}
            />
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Comments For Me" loading={loading} size="small" style={{ marginTop: 16 }}>
            <Table
              rowKey={(r, i) => i}
              size="small"
              dataSource={comments}
              columns={[
                { title: "Course", dataIndex: "code", render: (_, r) => `${r.code} ${r.name}` },
                { title: "Comment", dataIndex: "comment" },
                { title: "When", dataIndex: "createdAt" },
              ]}
              pagination={{ pageSize: 6 }}
            />
          </Card>
        </Col>
      </Row>
    </>
    );
}