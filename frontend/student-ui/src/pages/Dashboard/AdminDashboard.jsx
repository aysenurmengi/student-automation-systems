import { useEffect, useMemo, useState } from "react";
import { Tabs, Row, Col, Card, Statistic, Table, Form, Input, Button, Space, Select, message } from "antd";
import { UsersApi } from "../../api/users";
import { CoursesApi } from "../../api/courses";

export default function AdminDashboard() {
  // top stats
  const [stats, setStats] = useState({ students: 0, teachers: 0, courses: 0 });
  const [loading, setLoading] = useState(false);

  // lists
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [courses , setCourses ] = useState([]);

  const loadAll = async () => {
    try {
      const [s, t, c] = await Promise.all([
        UsersApi.listStudents(),
        UsersApi.listTeachers(),
        CoursesApi.list(),
      ]);
      setStudents(s.data);
      setTeachers(t.data);
      setCourses(c.data);
      setStats({ students: s.data.length, teachers: t.data.length, courses: c.data.length });
    } catch (e) {
      console.error(e);
      message.error("Veriler yüklenemedi");
    }
  };

  useEffect(() => { loadAll(); }, []);

  // --- create handlers ---
  const createStudent = async (v) => {
    setLoading(true);
    try {
      await UsersApi.createStudent({
        firstName: v.firstName,
        lastName : v.lastName,
        number   : v.number,
        password : v.password, // min 6
      });
      message.success("Student created");
      await loadAll();
    } catch (err) {
      const msg = err?.response?.data;
      message.error(Array.isArray(msg) ? msg.join(", ") : (msg || "Student create failed"));
    } finally { setLoading(false); }
  };

  const createTeacher = async (v) => {
    setLoading(true);
    try {
      await UsersApi.createTeacher({
        firstName: v.firstName,
        lastName : v.lastName,
        password : v.password,
      });
      message.success("Teacher created");
      await loadAll();
    } catch (err) {
      const msg = err?.response?.data;
      message.error(Array.isArray(msg) ? msg.join(", ") : (msg || "Teacher create failed"));
    } finally { setLoading(false); }
  };

  const createCourse = async (v) => {
    setLoading(true);
    try {
      await CoursesApi.create({
        code     : v.code,
        name     : v.name,
        teacherId: v.teacherId, // Teacher.UserId
      });
      message.success("Course created");
      await loadAll();
    } catch (err) {
      const msg = err?.response?.data;
      message.error(Array.isArray(msg) ? msg.join(", ") : (msg || "Course create failed"));
    } finally { setLoading(false); }
  };

  // teacher select options for course form
  const teacherOptions = useMemo(
    () => teachers.map(t => ({ value: t.userId, label: `${t.firstName} ${t.lastName}` })),
    [teachers]
  );

  return (
    <>
      {/* üst istatistikler */}
      <Row gutter={[16,16]} style={{marginBottom:16}}>
        <Col xs={24} md={8}><Card><Statistic title="Students" value={stats.students}/></Card></Col>
        <Col xs={24} md={8}><Card><Statistic title="Teachers" value={stats.teachers}/></Card></Col>
        <Col xs={24} md={8}><Card><Statistic title="Courses"  value={stats.courses}/></Card></Col>
      </Row>

      <Card
        title="Admin Panel"
        extra={<Button onClick={loadAll}>Refresh</Button>}
      >
        <Tabs
          defaultActiveKey="students"
          items={[
            {
              key: "students",
              label: "Students",
              children: (
                <Row gutter={[16,16]}>
                  <Col xs={24} md={12}>
                    <Card title="Student List" size="small">
                      <Table
                        rowKey="userId"
                        size="small"
                        dataSource={students}
                        pagination={{ pageSize: 8 }}
                        columns={[
                          { title:"Number", dataIndex:"number" },
                          { title:"First Name", dataIndex:"firstName" },
                          { title:"Last Name", dataIndex:"lastName" },
                        ]}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} md={12}>
                    <Card title="Add Student" size="small">
                      <StudentForm onSubmit={createStudent} loading={loading}/>
                    </Card>
                  </Col>
                </Row>
              )
            },
            {
              key: "teachers",
              label: "Teachers",
              children: (
                <Row gutter={[16,16]}>
                  <Col xs={24} md={12}>
                    <Card title="Teacher List" size="small">
                      <Table
                        rowKey="userId"
                        size="small"
                        dataSource={teachers}
                        pagination={{ pageSize: 8 }}
                        columns={[
                          { title:"First Name", dataIndex:"firstName" },
                          { title:"Last Name", dataIndex:"lastName" },
                        ]}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} md={12}>
                    <Card title="Add Teacher" size="small">
                      <TeacherForm onSubmit={createTeacher} loading={loading}/>
                    </Card>
                  </Col>
                </Row>
              )
            },
            {
              key: "courses",
              label: "Courses",
              children: (
                <Row gutter={[16,16]}>
                  <Col xs={24} md={12}>
                    <Card title="Course List" size="small">
                      <Table
                        rowKey="courseId"
                        size="small"
                        dataSource={courses}
                        pagination={{ pageSize: 8 }}
                        columns={[
                          { title:"Code", dataIndex:"code" },
                          { title:"Name", dataIndex:"name" },
                          { title:"TeacherId", dataIndex:"teacherId" },
                          { title:"Status", dataIndex:"status" },
                        ]}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} md={12}>
                    <Card title="Create Course" size="small">
                      <CourseForm onSubmit={createCourse} loading={loading} teacherOptions={teacherOptions}/>
                    </Card>
                  </Col>
                </Row>
              )
            }
          ]}
        />
      </Card>
    </>
  );
}

/* --- Forms --- */

function StudentForm({ onSubmit, loading }) {
  const [form] = Form.useForm();
  const submit = (v) => onSubmit(v).then(() => form.resetFields());

  return (
    <Form layout="vertical" form={form} onFinish={submit}>
      <Form.Item name="firstName" label="First Name" rules={[{required:true}]}><Input/></Form.Item>
      <Form.Item name="lastName"  label="Last Name"  rules={[{required:true}]}><Input/></Form.Item>
      <Form.Item name="number"    label="Number"     rules={[{required:true}]}><Input/></Form.Item>
      <Form.Item name="password"  label="Password"   rules={[{required:true, min:6}]}><Input.Password/></Form.Item>
      <Space style={{ display:"flex", justifyContent:"flex-end" }}>
        <Button onClick={()=>form.resetFields()}>Clear</Button>
        <Button type="primary" htmlType="submit" loading={loading}>Create</Button>
      </Space>
    </Form>
  );
}

function TeacherForm({ onSubmit, loading }) {
  const [form] = Form.useForm();
  const submit = (v) => onSubmit(v).then(() => form.resetFields());

  return (
    <Form layout="vertical" form={form} onFinish={submit}>
      <Form.Item name="firstName" label="First Name" rules={[{required:true}]}><Input/></Form.Item>
      <Form.Item name="lastName"  label="Last Name"  rules={[{required:true}]}><Input/></Form.Item>
      <Form.Item name="password"  label="Password"   rules={[{required:true, min:6}]}><Input.Password/></Form.Item>
      <Space style={{ display:"flex", justifyContent:"flex-end" }}>
        <Button onClick={()=>form.resetFields()}>Clear</Button>
        <Button type="primary" htmlType="submit" loading={loading}>Create</Button>
      </Space>
    </Form>
  );
}

function CourseForm({ onSubmit, loading, teacherOptions }) {
  const [form] = Form.useForm();
  const submit = (v) => onSubmit(v).then(() => form.resetFields());

  return (
    <Form layout="vertical" form={form} onFinish={submit}>
      <Form.Item name="code"  label="Code" rules={[{required:true}]}><Input/></Form.Item>
      <Form.Item name="name"  label="Name" rules={[{required:true}]}><Input/></Form.Item>
      <Form.Item name="teacherId" label="Teacher" rules={[{required:true}]}>
        <Select options={teacherOptions} placeholder="Select teacher" showSearch optionFilterProp="label" />
      </Form.Item>
      <Space style={{ display:"flex", justifyContent:"flex-end" }}>
        <Button onClick={()=>form.resetFields()}>Clear</Button>
        <Button type="primary" htmlType="submit" loading={loading}>Create</Button>
      </Space>
    </Form>
  );
}
