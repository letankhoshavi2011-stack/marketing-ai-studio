from typing import Dict, Any, List
from app.agents.base import BaseV4Agent
from app.agents.social_models import CrossPostInput, CrossPostOutput, SocialPost, BaseAgentOutput
from app.providers.gemini import GeminiProvider

class SocialToolsAgent(BaseV4Agent):
    def __init__(self):
        super().__init__()
        self.gemini = GeminiProvider()

    async def _execute_internal(self, input_data: Any, context_str: str) -> BaseAgentOutput:
        """Handles miscellaneous social media utility tasks."""
        
        prompt = f"""
        You are a Social Media Strategy Architect. Perform the following task:
        
        Task Type: {input_data.agent_id.replace('_', ' ')}
        Input Data/Content: {getattr(input_data, 'source_content', 'General workspace strategy')}
        Target Platforms: {", ".join(getattr(input_data, 'target_platforms', ['All']))}
        
        CONTEXT FROM WORKSPACE & OTHER AGENTS:
        {context_str}
        
        Requirements:
        1. Accuracy and strategic depth.
        2. Actionable recommendations.
        3. For cross-posting: Create platform-specific variations of the source content.
        4. For audits: Identify gaps and provide 5-step improvement plan.
        
        Respond in a structured professional Markdown format, including JSON blocks if needed for specific platform variations.
        """
        
        response = await self.gemini.generate_text(
            prompt=prompt,
            system_prompt="You are an expert social media analyst and cross-platform strategist." + self.get_language_instruction(input_data),
            model_tier="pro"
        )
        
        return BaseAgentOutput(
            agent_id=input_data.agent_id,
            success=True,
            text_content=response
        )
