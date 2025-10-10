from flask import Flask, request, jsonify
from flask_cors import CORS
from query import query_rag  # Import the refactored function

# Initialize the Flask application
app = Flask(__name__)

# Enable CORS (Cross-Origin Resource Sharing)
# This is crucial to allow your React frontend (running on a different port)
# to communicate with this backend server.
CORS(app)


# Define the API endpoint for querying
@app.route("/query", methods=["POST"])
def handle_query():
    """
    This function handles incoming POST requests to the /query endpoint.
    It expects a JSON payload with a "query_text" field.
    """
    # Get the JSON data from the request
    data = request.get_json()

    # Check if the query_text is provided
    if not data or "query_text" not in data:
        return jsonify({"error": "Missing query_text in request"}), 400

    query_text = data["query_text"]

    try:
        # Call your existing RAG function to get the response
        response_text, sources = query_rag(query_text)

        # Return the response and sources as JSON
        return jsonify({"response": response_text, "sources": sources})

    except Exception as e:
        # Handle any errors that might occur during the RAG process
        print(f"Error processing query: {e}")
        return jsonify({"error": "Failed to process the query."}), 500


if __name__ == "__main__":
    # Run the Flask app
    # host='0.0.0.0' makes it accessible on your local network
    app.run(host="0.0.0.0", port=5000, debug=True)
