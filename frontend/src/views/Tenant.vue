<template>
  <div>
    <div class="mb-5">
      <h1>Tenant API</h1>
      <p>
        Call an external API by clicking the button below. This will call the
        external API using an access token, and the API will validate it using
        the API's audience value.
      </p>
    </div>
    <div class="result-block-container">
      <div :class="['result-block', apiMessage ? 'show' : '']">
        <table class="table">
          <thead>
            <tr>
              <th>Key</th>
              <th>Value</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(value, key) in apiMessage" :key="key">
              <td>{{ key }}</td>
              <td>{{ value }}</td>
              <td>
                <button @click="sendPutRequest(value)">Update</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { useAuth0 } from "@auth0/auth0-vue";
import { ref } from "vue";
const apiMessage = ref();
export default {
  name: "tenant-view",
  setup() {
    const auth0 = useAuth0();
    const user = auth0.user;
    // Method to send PUT request
    const sendPutRequest = async (tenantId: string) => {
      const accessToken = await auth0.getAccessTokenSilently();
      try {
        const response = await fetch("/api/tenant", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`, // make sure accessToken is accessible here
          },
          body: JSON.stringify({ tenant_id: tenantId }),
        });

        if (response.ok) {
          console.log("Update successful!");
          let cacheMode = 'off';
          await auth0.getAccessTokenSilently({cacheMode});
        } else {
          console.error(`Error: ${response.statusText}`);
        }
      } catch (e: any) {
        console.error(`Error: ${e}`);
      }
    };
    return {
      apiMessage,
      sendPutRequest,
      user,
    };
  },
  async beforeMount() {
    const auth0 = useAuth0();
    const accessToken = await auth0.getAccessTokenSilently();
    try {
      const response = await fetch("/api/tenant", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();
      apiMessage.value = data;
    } catch (e: any) {
      apiMessage.value = `Error: the server responded with '${e.response.status}: ${e.response.statusText}'`;
    }
  }
};
</script>

