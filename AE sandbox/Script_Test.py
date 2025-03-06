from transformers import AutoModel

model_id = "deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B"

try:
    model = AutoModel.from_pretrained(model_id)
    print(f"The model '{model_id}' is installed.")
except Exception as e:
    print(f"The model '{model_id}' is not installed. Error: {e}")