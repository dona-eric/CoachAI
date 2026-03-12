import os
import dotenv
import sys
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from langchain_huggingface.embeddings import HuggingFaceEmbeddings

dotenv.load_dotenv()



def get_embedding_model():

    try:
        if os.getenv("EMBEDDING_MODEL_NAME") is None:
            raise ValueError("EMBEDDING_MODEL_NAME environment variable is not set.")
    
        model_embedding = os.getenv("EMBEDDING_MODEL_NAME")

        embeddings = HuggingFaceEmbeddings(
            model_name = model_embedding,
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": True}
        )
    except Exception as e:
        print(f"Error occurred while fetching embedding model: {e}")
        raise

    return embeddings