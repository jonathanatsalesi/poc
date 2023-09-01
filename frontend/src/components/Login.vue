<script lang="ts">
import { useAuth0 } from '@auth0/auth0-vue';

export default {
  name: "Login",
  setup() {
    window.location = `https://dev-f7sryk8l4taw52yj.uk.auth0.com/authorize?response_type=code&client_id=jO5Zggmr3izMN4azZTuv3rASheGP9LZ8&redirect_uri=https://azrofrontend.z13.web.core.windows.net/&`+ window.location.search
  }
};
</script>