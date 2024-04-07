interface Env {

}

// export const onRequest: PagesFunction<Env> = async (context) => {
//   return new Response("aaaa")
// }

export default {
  async onRequest(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return new Response("aaaa")
  }
}
export async function onRequest(ctx:ExecutionContext) {
}

// export default {
// 	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
//   }
// }
