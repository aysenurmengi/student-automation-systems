import {useState, useEffect, useMemo} from "react";
import { Row, Col, Card, Table, Form, Input, Button, Space, Select, message } from "antd";
import { UsersApi } from "../../api/users";
import { CoursesApi } from "../../api/courses";
import {GradesApi} from "../../api/grades";

export default function TeacherCourses() {
    const [loading, setLoading] = useState(false);

    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const [courseStudents, setCourseStudents] = useState([]);

    const loadAll = async () => {
        setLoading(true);
        try {
            const [s,c] =await Promise.all([
                UsersApi.listStudents(),
                CoursesApi.list()
            ]);
            setStudents(s.data || []);
            setCourses(c.data || []);
        } catch (error) {
            console.error(error);
            message.error("Veriler Yüklenemedi");
        } finally{
            setLoading(false)
        };
    };

    useEffect(() => {loadAll();}, []);

    useEffect(() => {
    const loadCourseStudents = async () => {
        if (!selectedCourseId) { setCourseStudents([]); return; }
        try {
            const res = await CoursesApi.listStudents(selectedCourseId); // GET /api/courses/{id}/students
            setCourseStudents(res?.data ?? res ?? []);
        } catch (e) {
            console.error(e);
            message.error("Course students yüklenemedi");
        }
    };
    loadCourseStudents();
    }, [selectedCourseId]);

    const enrolledStudentOptions = useMemo(
        () => (courseStudents || []).map(s => ({
        value: s.studentId ?? s.StudentId,
        label: `${(s.firstName ?? s.FirstName) || ""} ${(s.lastName ?? s.LastName) || ""} (${(s.number ?? s.Number) || "-"})`,
    })),
    [courseStudents]
    );


    const addGrade = async (v) => {
        if(!selectedCourseId) {message.warning("Önce bir ders seçini yapınız."); return;}
        setLoading(true);
        try {
            await GradesApi.add({
                courseId: selectedCourseId,
                studentId: v.studentId,
                score: Number(v.score),
            });
            message.success("Grade added");
        } catch (err) {
            const msg = err?.response?.data;
            message.error(Array.isArray(msg) ? msg.join(", ") : (msg || "Add grade failed"));
        } finally{
            setLoading(false);
        };
    }

    const createCourse = async (v) => {
        setLoading(true);
        try {
            await CoursesApi.create({
                code: v.code,
                name: v.name
            });
            message.success("course created");
            await loadAll();
        } catch (err) {
            const msg = err?.response?.data;
            message.error(Array.isArray(msg) ? msg.join(", ") : (msg || "Course create failed"));
        } finally {
            setLoading(false);
        };
    };

    //derse öğrenci ekleme
    const addStudentToCourse = async(v) => {
        if(!selectedCourseId) {
            message.warning("lütfen önce bir ders seçin.");
            return;
        }
        setLoading(true);
        try {
            await CoursesApi.addEnrollment(selectedCourseId, {studentId: v.studentId});
            message.success("student added to course");
            await loadAll();
            const res = await CoursesApi.listStudents(selectedCourseId);
            setCourseStudents(res?.data ?? res ?? []);
        } catch (err) {
            const msg = err?.response?.data;
            message.error(Array.isArray(msg) ? msg.join(", ") : (msg || "Add student failed"));
        } finally {
            setLoading(false);
        };
    }

    const courseOptions = useMemo(
        () => (courses || []).map(c => ({value: c.courseId ?? c.id, label: `${c.code ?? ""} ${c.name ?? ""}`.trim()})),
        [courses]
    );
    // ders için öğrenci seçimi
    const studentOptions = useMemo(
        () => (students || []).map(s => ({value: s.userId ?? s.id ?? s.studentId, label:`${s.firstName} ${s.lastName} (${s.number})` })),
        [students]
    );

    //seçili dersin öğrencilerini hesaplama
    const selectedCourse = useMemo(
        () => (courses || []).find(c=>(c.courseId ?? c.id) === selectedCourseId),
        [courses, selectedCourseId]
    );

    // const selectedCourseStudents = useMemo(() => {
    //     const enrollments = selectedCourse?.enrollments ?? selectedCourse?.Enrollments ?? [];
    //     if(!Array.isArray(enrollments) || enrollments.length ===0 ) return [];

    //     const idSet = new Set(enrollments.map(e => e.studentId == e.StudentId));
    //     return (students || []).filter(s => idSet.has(s.userId ?? s.id));
    // }, [selectedCourse, students]);

    return (
        <Row gutter={[16,16]}>
            <Col xs={24} md={12}>
                <Card title="Courses"
                    size="small"
                    extra={
                        <Select
                            style={{ width: 240 }}
                            value={selectedCourseId}
                            onChange={setSelectedCourseId}
                            options={courseOptions}
                            placeholder="Select a course"
                            showSearch
                            optionFilterProp="label"
                        />
                    }
                >
                    <Table
                        rowKey={(r) => r.courseId ?? r.id}
                        size="small"
                        loading={loading}
                        dataSource={courses}
                        pagination={{pageSize:8}}
                        columns={[
                            {title: "Code", dataIndex:"code"},
                            {title: "Name", dataIndex:"name"},
                            {title: "Students", render: (_, rec) => (rec.enrollments?.length ?? rec.Enrollments?.length ?? 0 )},
                        ]}
                        onRow={(rec) => ({
                            onClick: () => setSelectedCourseId(rec.courseId ?? rec.id),
                            style: {cursor:"pointer"}
                        })}
                    />    
                </Card>

                <Card title="Create Course" size="small" style={{marginTop: 16}}>
                    <CourseForm onSubmit={createCourse} loading={loading}/>
                </Card>
            </Col>

            <Col xs={24} md={12}>
                <Card
                    title={`Course Students${selectedCourse ? `: ${(selectedCourse.code ?? "")} ${(selectedCourse.name ?? "")}` : ""}`}
                    size="small"
                >
                    <Table
                        rowKey={(r) => r.userId ?? r.id ?? r.number}
                        size="small"
                        loading={loading}
                        dataSource={selectedCourse ? courseStudents : []}
                        pagination={{ pageSize: 8 }}
                        columns={[
                        { title: "Number", dataIndex: "number" },
                        { title: "First Name", dataIndex: "firstName" },
                        { title: "Last Name", dataIndex: "lastName" },
                        ]}
                        locale={{ emptyText: selectedCourse ? "No students in this course." : "Select a course." }}
                    />
                </Card>

                <Card title="Add Student To Course" size="small" style={{ marginTop: 16 }}>
                    <AddEnrollmentForm
                        loading={loading}
                        students={studentOptions}
                        onSubmit={addStudentToCourse}
                        disabled={!selectedCourseId}
                    />
                 </Card>

                 <Card title="Add Grade" size="small" style={{marginTop: 16}}>
                    <AddGradeForm
                        onSubmit={addGrade}
                        loading={loading}
                        students={enrolledStudentOptions}
                        disabled={!selectedCourseId || enrolledStudentOptions.length === 0}
                    />
                 </Card>
            </Col>

        </Row>
    );

}

function CourseForm({ onSubmit, loading }) {
  const [form] = Form.useForm();
  const submit = (v) => onSubmit(v).then(() => form.resetFields());

  return (
    <Form layout="vertical" form={form} onFinish={submit}>
      <Form.Item name="code" label="Code" rules={[{ required: true }]}><Input /></Form.Item>
      <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input /></Form.Item>
      <Space style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button onClick={() => form.resetFields()}>Clear</Button>
        <Button type="primary" htmlType="submit" loading={loading}>Create</Button>
      </Space>
    </Form>
  );
}

function AddEnrollmentForm({ onSubmit, loading, students, disabled }) {
  const [form] = Form.useForm();
  const submit = (v) => onSubmit(v).then(() => form.resetFields());

  return (
    <Form layout="vertical" form={form} onFinish={submit}>
      <Form.Item name="studentId" label="Student" rules={[{ required: true }]}>
        <Select
          options={students}
          placeholder={disabled ? "Select a course first" : "Select student"}
          disabled={disabled}
          showSearch
          optionFilterProp="label"
        />
      </Form.Item>
      <Space style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button onClick={() => form.resetFields()} disabled={disabled}>Clear</Button>
        <Button type="primary" htmlType="submit" loading={loading} disabled={disabled}>Add</Button>
      </Space>
    </Form>
  );

}

function AddGradeForm({onSubmit, loading, students, disabled}) {
    const [form] = Form.useForm();
    const submit = (v) => onSubmit(v).then(() => form.resetFields());

    return (
        <Form layout="vertical" form={form} onFinish={submit}>
            <Form.Item name="studentId" label="Student" rules={[{required:true}]}>
                <Select
                    options={students}
                    placeholder={disabled ? "Select a course first" : "Select student"}
                    disabled={disabled}
                    showSearch
                    optionFilterProp="label"
                />
            </Form.Item>
            <Form.Item name="score" label="Score" rules={[{required: true}]}>
                <Input type="number" min={0} max={100} step="0.1"/>
            </Form.Item>
            <Space style={{display: "flex", justifyContent:"flex-end"}}>
                <Button onClick={() => form.resetFields()} disabled= {disabled}> Clear </Button>
                <Button type="primary" htmlType="submit" loading={loading} disabled={disabled}>Add Grade</Button>
            </Space>
        </Form>
    );
}
