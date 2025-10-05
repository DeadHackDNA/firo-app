import httpClient from "./http-client.ts";

interface RequestBody {
    name: string,
    email: string
}
export interface CreateUserResponse {
    id: string,
    name: string,
    email: string,
}

export async function createUser(name: string): Promise<CreateUserResponse> {
    try {
        const requestBody: RequestBody = {
            name,
            email: `${name.toLowerCase()}@email.com`
        }
        const response =
            await httpClient.post<CreateUserResponse>("/users", requestBody);
        return response.data;
    } catch (error) {
        console.log("Error creating user:",error);
        throw error;
    }
}


