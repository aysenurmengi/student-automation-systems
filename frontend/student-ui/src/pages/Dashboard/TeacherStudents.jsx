import { useEffect, useState, useMemo } from "react";
import {  Row, Col, Card, Table, Form, Input, Button, Space, Select, message, Tabs } from "antd";
import { UsersApi } from "../../api/users";
import { CoursesApi } from "../../api/courses";

export default function TeacherStudents() {
    const [loading, setLoading] = useState(false);

    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState(null);

    const loadAll = async () => {
        setLoading(true);
        try {
            const [s, c] = await Promise.all([
                UsersApi.listStudents(),
                CoursesApi.list()
            ]);
            setStudents(s.data || []);
            setCourses(c.data || []);
        } catch (error) {
            console.error(error);
            message.error("Veriler yüklenemedi");
        } finally {
            setLoading(false);
        }
    };    
    useEffect(() => { loadAll(); }, []);

    //create
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
        }catch (err) {
            const msg = err?.response?.data;
            message.error(Array.isArray(msg) ? msg.join(", ") : (msg || "Student create failed"));
        } finally { setLoading(false)};
    };

    const createComment = async (v) => {
        const courseId  = v.courseId ?? selectedCourseId;
        const studentId = v.studentId;
        const comment   = v.comment;

        if (!courseId || !studentId) {
            message.warning("Lütfen ders ve öğrenci seçin.");
            return;
        }

        setLoading(true);
        try {
            await CoursesApi.createComment(courseId, {studentId, comment});
            message.success("Comment created");
            await loadAll();
        } catch (err) {
            const msg = err?.response?.data;
            message.error(Array.isArray(msg) ? msg.join(", ") : (msg || "Comment create failed"));
        } finally { setLoading(false)};
    };
    
    //options
    const courseOptions = useMemo(
        () => (courses || []).map(c => ({ value: c.courseId ?? c.id, label: `${c.code ?? ""} ${c.name ?? ""}`.trim() })),
        [courses]
    );

    const studentOptions = useMemo(
        () => (students || []).map(s => ({ value: s.userId ?? s.id, label: `${s.firstName} ${s.lastName} (${s.number})` })),
        [students]
    );

    return(
        <>
        <Row gutter={[16,16]} style={{marginBottom:16}}>
            <Col xs={24} md={24}>
                <Card title= "Student List" size="small">
                    <Table
                        rowKey={(r) => r.userId ?? r.id ?? r.number}
                        size="small"
                        loading={loading}
                        dataSource={students}
                        pagination={{pageSize:8}}
                        columns={[
                            {title:"Number", dataIndex:"number"},
                            {title:"First Name", dataIndex:"firstName"},
                            {title:"Last Name", dataIndex:"lastName"}
                        ]}
                    />
                </Card>
            </Col>
            <Col xs={24} md={24}>
                <Card size="small">
                    <Tabs
                        defaultActiveKey="addStudent"
                        items={[
                            {
                                key: "addStudent",
                                label: "Add Student",
                                children: <StudentForm onSubmit={createStudent} loading={loading} />
                            },
                            {
                                key: "addComment",
                                label: "Add Comment",
                                children: (
                                    <div style={{ paddingTop: 8 }}>
                                        <CommentForm
                                            onSubmit={createComment}
                                            loading={loading}
                                            courseOptions={courseOptions}
                                            studentOptions={studentOptions}
                                            defaultCourseId={selectedCourseId}
                                        />
                                    </div>
                                )
                            }
                        ]}
                    />
                </Card>
            </Col>
        </Row>
        </>
    );
}

function StudentForm({ onSubmit, loading }) {
  const [form] = Form.useForm();
  const submit = (v) => onSubmit(v).then(() => form.resetFields());

  return (
    <Form layout="vertical" form={form} onFinish={submit}>
      <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}><Input /></Form.Item>
      <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}><Input /></Form.Item>
      <Form.Item name="number" label="Number" rules={[{ required: true }]}><Input /></Form.Item>
      <Form.Item name="password" label="Password" rules={[{ required: true, min: 6 }]}><Input.Password /></Form.Item>
      <Space style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button onClick={() => form.resetFields()}>Clear</Button>
        <Button type="primary" htmlType="submit" loading={loading}>Create</Button>
      </Space>
    </Form>
  );
}

function CommentForm({ onSubmit, loading, courseOptions, studentOptions, defaultCourseId }) {
  const [form] = Form.useForm();
  useEffect(() => {
    if (defaultCourseId) form.setFieldsValue({ courseId: defaultCourseId });
  }, [defaultCourseId, form]);

  const submit = (v) => onSubmit(v).then(() => form.resetFields(["comment"]));

  return (
    <Form layout="vertical" form={form} onFinish={submit}>
      <Form.Item name="courseId" label="Course" rules={[{ required: true }]}>
        <Select options={courseOptions} placeholder="Select course" showSearch optionFilterProp="label" />
      </Form.Item>
      <Form.Item name="studentId" label="Student" rules={[{ required: true }]}>
        <Select options={studentOptions} placeholder="Select student" showSearch optionFilterProp="label" />
      </Form.Item>
      <Form.Item name="comment" label="Comment" rules={[{ required: true }]}>
        <Input.TextArea rows={4} />
      </Form.Item>
      <Space style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button onClick={() => form.resetFields()}>Clear</Button>
        <Button type="primary" htmlType="submit" loading={loading}>Add</Button>
      </Space>
    </Form>
  );
}

