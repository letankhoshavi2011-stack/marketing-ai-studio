from typing import Any, Dict, Type
from pydantic import BaseModel, create_model

def request_dynamic_form(form_title: str, fields: list[dict[str, Any]]) -> dict[str, Any]:
    """Requests user input by rendering a dynamic form in the frontend UI.
    
    Args:
        form_title: The title or instructions for the form (e.g., "Please provide the Campaign Details")
        fields: A list of field definitions. Each field must be a dictionary with at least:
                - name (str): The unique variable name (e.g., "target_audience")
                - type (str): The data type ("string", "integer", "boolean", "array")
                - description (str): The label or description shown to the user
                - required (bool, optional): Whether the field is mandatory (default: true)
                - enum (list, optional): A list of allowed values for dropdowns
    
    Returns:
        dict: The final generated JSON Schema which the orchestrator intercepts and sends to the UI.
    """
    
    pydantic_fields = {}
    
    for field in fields:
        field_name = field["name"]
        field_type_str = field.get("type", "string").lower()
        required = field.get("required", True)
        description = field.get("description", "")
        enum_vals = field.get("enum")
        
        # Map string types to Python types
        if field_type_str == "integer" or field_type_str == "int":
            py_type = int
        elif field_type_str == "boolean" or field_type_str == "bool":
            py_type = bool
        elif field_type_str == "array" or field_type_str == "list":
            py_type = list[str]
        else:
            py_type = str
            
        # Handle optional
        if not required:
            py_type = py_type | None
            default_val = None
        else:
            default_val = ...
            
        # We use a tuple for create_model: (type, Field(...))
        # But for simplicity, we'll just define the type and default
        pydantic_fields[field_name] = (py_type, default_val)
        
    # Dynamically create a Pydantic Model
    DynamicModel = create_model('DynamicUserForm', **pydantic_fields)
    
    # Generate the JSON Schema
    schema = DynamicModel.model_json_schema()
    schema["title"] = form_title
    
    # Enrich the schema with descriptions and enums since create_model is basic
    if "properties" in schema:
        for field in fields:
            prop = schema["properties"].get(field["name"])
            if prop:
                if "description" in field:
                    prop["description"] = field["description"]
                if "enum" in field:
                    prop["enum"] = field["enum"]
    
    # Return a special dict that the orchestrator recognizes as a form request
    return {
        "status": "NEEDS_INPUT",
        "ui_hints": schema
    }
