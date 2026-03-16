from google.adk.agents import LlmAgent

from app.config import settings


def create_conversation_state_agent() -> LlmAgent:
    """Creates the conversation state agent that tracks progress."""
    return LlmAgent(
        name="ConversationState",
        model=settings.gemini_model,
        description="Tracks conversation state and summarizes what has been accomplished.",
        instruction="""You are a conversation state tracker for a marketing platform.

Current context: {context_summary}
Current version: {current_version}

Summarize:
1. What has been completed so far (which assets exist)
2. What the user is currently working on
3. What logical next steps would be

Keep your summary concise and structured. This summary helps other agents
understand where we are in the workflow.

Format:
COMPLETED: <comma-separated list of completed items>
IN_PROGRESS: <what is currently being worked on>
NEXT_STEPS: <suggested next actions>""",
        output_key="conversation_state",
    )
