<template>
	<div>
		<div class="login-page">
			<div class="form">
				<!-- <form class="login-form"> -->
					<input type="text" placeholder="username" v-model="username"/>
					<input type="password" placeholder="password" v-model="password"/>
				<!-- </form> -->
			</div>
		</div>
	</div>
</template>

<script>

var mapGetters = require('vuex').mapGetters;

module.exports = {
	name: 'Login',
	data() {
		return {
			username: '',
			password: ''
		};
	},
	methods: {
		async login () {
			let login = await this.$store.dispatch ('user/login', {
				username: this.username,
				password: this.password
			});

			if (login)
			{
				if (this.role === 'admin')
				{
					this.$store.dispatch ('settings/redirect', 'ADMIN');
				}
				else
				{
					this.$store.dispatch ('settings/redirect', 'LAB');
				}
			}
			else {
				this.username = '';
				this.password = '';
			}
		}
	},
	computed: mapGetters ({
		role: 'user/role'
	})
};

</script>