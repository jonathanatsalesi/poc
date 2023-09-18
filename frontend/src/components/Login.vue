<script lang="ts">
import { useAuth0 } from '@auth0/auth0-vue';
import { useRoute } from 'vue-router';

export default {
  name: "Login",
  setup() {
    const { loginWithRedirect } = useAuth0();
    const route = useRoute();
    // Accessing query parameters with type checks
    const organization = typeof route.query.organization === 'string' ? route.query.organization : undefined;
    const invitation = typeof route.query.invitation === 'string' ? route.query.invitation : undefined;
    console.log(route.query);
    console.log(route.params)
    // Using a redirect
    loginWithRedirect({
      authorizationParams: {
        organization,
        invitation,
      }
    });
  }
};
</script>