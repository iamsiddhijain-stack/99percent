/* Field Agent configuration.
 *
 * SECURITY: never put an API key in this file or anywhere else in front-end code.
 * Anything the browser loads can be read by every visitor.
 *
 * By default the Field Agent is a SIMULATION: it searches the local database in the
 * browser and assembles answers from the database's own text. No language model runs.
 *
 * To connect a real model later, run your own small server that keeps the key in an
 * environment variable, and put that server's URL here. The page will send it the
 * question plus the retrieved passages (see js/agent.js, askServer) and show the reply
 * separately from the retrieved book text.
 */
window.FIELD_AGENT_ENDPOINT = '';   // e.g. 'https://your-server.example/api/field-agent'
