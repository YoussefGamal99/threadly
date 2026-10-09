"""All agent tools."""
from app.agent.tools.cart import add_to_cart, remove_from_cart, view_cart
from app.agent.tools.catalog import compare_products, get_product_details, search_products, semantic_search
from app.agent.tools.memory import save_user_preferences
from app.agent.tools.outfit import complete_the_outfit
from app.agent.tools.sizing import size_advisor

ALL_TOOLS = [
    search_products,
    semantic_search,
    get_product_details,
    compare_products,
    complete_the_outfit,
    size_advisor,
    add_to_cart,
    view_cart,
    remove_from_cart,
    save_user_preferences,
]
