from typing import Dict, Any, List
from app.agents.base import BaseV4Agent
from app.models.base import BaseAgentOutput
from app.providers.gemini import GeminiProvider

class VideoUtilityAgent(BaseV4Agent):
    def __init__(self):
        super().__init__()
        self.gemini = GeminiProvider()

    async def _execute_internal(self, input_data: Any, context_str: str) -> BaseAgentOutput:
        """Handles miscellaneous video utility tasks (Summarization, Motion Graphics, AI Gen)."""
        
        prompt = f"""
        You are a Video Multi-Tool Expert. Perform the following task:
        
        Task Type: {input_data.agent_id.replace('_', ' ')}
        Topic/Source: {getattr(input_data, 'topic', 'Workspace Context')}
        
        CONTEXT FROM WORKSPACE & OTHER AGENTS:
        {context_str}
        
        Requirements:
        1. For AI Video Gen: Provide 3 high-detail prompts (realistic, cinematic, stylized) for tools like Runway/Luma.
        2. For Summarization: Provide a 1-paragraph summary and 5 key highlights with estimated timestamps.
        3. For Motion Graphics: Describe 3 distinct visual styles (typography, transitions, color grading) based on brand personality.
        4. For Snippets: Identify the most "viral-ready" segments from a conceptual transcript.
        
        Respond in a structured professional Markdown format.
        """
        
        response = await self.gemini.generate_text(
            prompt=prompt,
            system_prompt="You are an expert video editor and AI motion strategist." + self.get_language_instruction(input_data),
            model_tier="pro"
        )
        
        return BaseAgentOutput(
            agent_id=input_data.agent_id,
            success=True,
            text_content=response
        )
