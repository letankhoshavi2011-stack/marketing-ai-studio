from typing import Dict, Any, List
from app.agents.base import BaseV4Agent
from app.agents.video_models import VideoScriptInput, VideoScriptOutput, VideoScene
from app.providers.gemini import GeminiProvider

class YouTubeAgent(BaseV4Agent):
    def __init__(self):
        super().__init__()
        self.gemini = GeminiProvider()

    async def _execute_internal(self, input_data: Any, context_str: str) -> BaseAgentOutput:
        """Generates YouTube specific strategy and content."""
        
        prompt = f"""
        You are a YouTube Growth Strategist & Content Creator. Perform the following for:
        
        Agent ID: {input_data.agent_id}
        Topic: {input_data.topic}
        
        CONTEXT FROM WORKSPACE & OTHER AGENTS:
        {context_str}
        
        Requirements:
        1. For YouTube Strategy: Provide niche positioning, 5 content ideas, and competitor gaps.
        2. For Descriptions: Include click-worthy titles, SEO-optimized description, and timestamp suggestions.
        3. For Topic Finder: Identify 10 trending topics based on current search volume and brand relevance.
        
        Respond in a structured professional Markdown format.
        """
        
        response = await self.gemini.generate_text(
            prompt=prompt,
            system_prompt="You are a YouTube expert specializing in channel growth and video SEO." + self.get_language_instruction(input_data),
            model_tier="pro"
        )
        
        from app.models.base import BaseAgentOutput
        return BaseAgentOutput(
            agent_id=input_data.agent_id,
            success=True,
            text_content=response
        )
