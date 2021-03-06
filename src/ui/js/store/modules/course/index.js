var Vue = require ('vue');
var setup = require ('../../setup.js');

var KEY_TOKEN = 'wyliodrin.token';
Vue.http.interceptors.push(function(request, next) {
	if (window.localStorage.getItem (KEY_TOKEN))
	{
		request.headers.set('Authorization', 'Bearer '+window.localStorage.getItem (KEY_TOKEN));
	}
	next();
});

module.exports ={
	namespaced: true,
	state: {
		token: window.localStorage.getItem (KEY_TOKEN),
		course: null,
		courses: null
	},
	getters: {
		token (state)
		{
			return state.token;
		},
		course (state)
		{
			return state.course;
		},
		courses (state)
		{
			return state.courses;
		}
	},
	actions: {
		async listCourses (store)
		{
			try
			{
				let response = await Vue.http.get (setup.API+'/admin/list_courses');
				if (response.data.err === 0) {
					console.log (response.data.courses);
					store.commit ('courses', response.data.courses);
					return true;
				}
				return false;
			}
			catch (e)
			{
				return false;
			}
		},

		async getCourse (store, courseId)
		{
			try 
			{
				let response = await Vue.http.get (setup.API+'/admin/get_course/' + courseId);
				if (response.data.err === 0) {
					console.log (response.data.course);
					store.commit ('course', response.data.course);
					return true;
				}
				return false;
			}
			catch (e)
			{
				return false;
			}
		},

		async createCourse (store, courseName)
		{
			try
			{
				let response = await Vue.http.post (setup.API + '/admin/add_course', courseName);
				if (response.data.err === 0) {
					await store.dispatch ('listCourses');
					return true;
				}
				else 
					return false;
			}
			catch (e)
			{
				return false;
			}
		},

		async editCourseName (store, courseUpdateQuery)
		{
			try
			{
				let response = await Vue.http.post (setup.API + '/admin/update_course', courseUpdateQuery);
				if (response.data.err === 0) {
					await store.dispatch ('listCourses');
					await store.dispatch ('getCourse', courseUpdateQuery.courseId);
					return true;
				}
				else 
					return false;
			}
			catch (e)
			{
				return false;
			}
		},

		async deleteCourse (store, courseId)
		{
			try 
			{
				let response = await Vue.http.post (setup.API + '/admin/remove_course', courseId);
				if (response.data.err === 0) {
					await store.dispatch ('listCourses');
					return true;
				}
				else 
					return false;
			}
			catch (e)
			{
				return false;
			}
		},

		async deleteStudentFromCourse (store, courseUserQuery)
		{
			try
			{
				console.log(courseUserQuery);
				let response = await Vue.http.post (setup.API+'/admin/remove_student', courseUserQuery);
				if (response.data.err === 0) {
					await store.dispatch ('listCourses');
					await store.dispatch ('getCourse', courseUserQuery.courseId);
					return true;
				} else {
					console.log(response);
					return false;
				}
			}
			catch (e)
			{
				return false;
			}
		},

		async addStudentToCourse (store, courseUserQuery)
		{
			try
			{
				console.log(courseUserQuery);
				let response = await Vue.http.post (setup.API+'/admin/add_student', courseUserQuery);
				if (response.data.err === 0) {
					await store.dispatch ('listCourses');
					await store.dispatch ('getCourse', courseUserQuery.courseId);
					return true;
				} else {
					console.log(response);
					return false;
				}
			}
			catch (e)
			{
				return false;
			}
		},

		async deleteTeacherFromCourse (store, courseTeacherQuery)
		{
			try
			{
				console.log(courseTeacherQuery);
				let response = await Vue.http.post (setup.API+'/admin/remove_teacher', courseTeacherQuery);
				if (response.data.err === 0) {
					await store.dispatch ('listCourses');
					await store.dispatch ('getCourse', courseTeacherQuery.courseId);
					return true;
				} else 
					return false;
			}
			catch (e)
			{
				return false;
			}
		},

		async addTeacherToCourse (store, courseTeacherQuery)
		{
			try
			{
				console.log(courseTeacherQuery);
				let response = await Vue.http.post (setup.API+'/admin/add_teacher', courseTeacherQuery);
				if (response.data.err === 0) {
					await store.dispatch ('listCourses');
					await store.dispatch ('getCourse', courseTeacherQuery.courseId);
					return true;
				} else {
					console.log(response);
					return false;
				}
			}
			catch (e)
			{
				return false;
			}
		}
	},
	mutations: 
	{
		token (state, value)
		{
			if (value !== null)
			{
				window.localStorage.setItem (KEY_TOKEN, value);
				state.token = value;
			}
			else
			{
				window.localStorage.removeItem (KEY_TOKEN);
				state.token = undefined;
			}
		},
		course (state, value)
		{
			state.course = value;
		},
		courses (state, value)
		{
			state.courses = value;
		}
	}
};